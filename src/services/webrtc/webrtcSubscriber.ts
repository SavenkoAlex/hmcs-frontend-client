import Janus, { JanusJS,  } from 'janus-gateway'
import { StreamHandler } from  '@/services/webrtc/webrtcAbstract'

 import { 
  JanusPlugin,
  WebRTCHandlerConstructor,
  Room
} from '@/types/global'

import { 
  VIDEO_ROOM_PLUGIN_EVENT, 
  VideoRoomPluginError,
} from '@/types/janus'
import { textChangeRangeIsUnchanged } from 'typescript'

/**
 * WebRTCHandler main functions to control webrtc connection (subscriber)
 */
export interface WebRTCHandler {
  connect: (room: number, to: number) => Promise <boolean>
  leave: (from: number) => Promise <boolean>
  getStreams: () => Promise<Room[] | null>
  requestPrivate?: (subscribers: unknown[], mountId: number) => Promise <boolean>
  sendMessage?: (mes: string) => Promise <boolean>
}

export class SubscriberStreamHandler extends StreamHandler implements  WebRTCHandler { 
  
  private mediaTracks: MediaStreamTrack[]
  private handlerInstance: JanusJS.PluginHandle | null
  private janusInstance: Janus | null
  isHandlerEstbilished: boolean

  private constructor ({
    handler, 
    emitter,
  }: Omit<WebRTCHandlerConstructor, 'options'>) {
    super({ handler, emitter })
    this.mediaTracks = []
    this.handlerInstance = null
    this.isHandlerEstbilished = false
    this.janusInstance = null
  }

  // Static constructor
  static init (
    webrtcPlugin: typeof Janus, 
    pluginName: JanusPlugin.VITE_WEBRTC_PLUGIN, 
  ): SubscriberStreamHandler | null {
    
    try {
      const result = super.init(webrtcPlugin, pluginName)

      if (!result) {
        return null
      }

      const { handler, emitter } = result
      const streamHandler = new SubscriberStreamHandler({ handler, emitter })
      streamHandler.listen()
      return streamHandler
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async handle () {
    const janusHandlers = await this.handler()
    if (!janusHandlers?.janusHandler|| !janusHandlers?.janusInstance) {
      return
    }
    this.handlerInstance = janusHandlers.janusHandler
    this.janusInstance = janusHandlers.janusInstance
    this.isHandlerEstbilished = true
  }

  // attach a event listener on janus events
  protected listen () {
    // Catching Janus on message event
    this.emitter.on('janus-onmessage', async ({jsep, msg}) => {
      if (msg.error) {
        console.error(msg.error)
        this.emitter.emit('janus-error', msg.error_code)
        return
      }

      const eventType: VIDEO_ROOM_PLUGIN_EVENT = msg.videoroom

      try {
        await this.handlePluginEvent(eventType, msg, jsep)
      } catch (err) {
        console.error(err)
        this.emitter.emit('janus-error', VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN_ERROR)
      }
    })
  }

  protected async handlePluginEvent (eventType: VIDEO_ROOM_PLUGIN_EVENT | 'event', msg: JanusJS.Message, jsep?: JanusJS.JSEP) {
    switch (eventType) {
      case VIDEO_ROOM_PLUGIN_EVENT.SUB_JOINED:
        this.emitter.emit('video-subscribed', msg)
        break

      case VIDEO_ROOM_PLUGIN_EVENT.DESTROYED:
        this.emitter.emit('video-destroyed')
        break

      case VIDEO_ROOM_PLUGIN_EVENT.ATTACHED:
        if (!jsep) {
          this.emitter.emit('janus-error', VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN_ERROR)
          break
        }

        this.emitter.emit('video-attached', msg.streams)

        this.handlerInstance?.createAnswer({
          jsep,
          success: (sdp) => this.attach(sdp)
        })
        break

      case VIDEO_ROOM_PLUGIN_EVENT.STARTED:
        if (msg.started) {
          this.emitter.emit('video-started', msg.started === 'ok')
        }
        break

      case 'event': 
        /*
        let extendetEventType  = null
        for (const event of Object.values(videoRoomPluginEvent)) {
          if (msg[event]) {
            extendetEventType = event
          }
        }

        if (!extendetEventType) {
          console.warn('unhandled message ', eventType, msg)
          break
        }
        this.emitter.emit(`video-${extendetEventType}`)
        */
        break

      default:
        console.warn('unhandled message ', eventType)
    }
  }

  async leave (): Promise <boolean> {
    return new Promise (resolve => {
      const message = {
        request: 'leave',
      }

      this.handlerInstance?.send({
        message,
        success: () => resolve(true),
        error: () => resolve(false)
      })
    })
  }

  /** check if room exists */
  async isStreamAvailable (roomId: number): Promise <boolean> {
    return new Promise (resolve => {
        if (!roomId) {
        resolve(false)
        return
      }

      const message = {
        request: 'exists',
        room: roomId
      }
      
      this.handlerInstance?.send({
        message,
        success: (data) => resolve(!!data?.exists),
        error: () => resolve(false)
      })
    })
    
  }

  getStreams(): Promise <Room[]> {

    return new Promise(resolve => {
      if (!this.handler) {
        return []
      }

      const message = {
        request: 'list',
      }

      this.handlerInstance?.send({
        message,
        success: (res) => {
          if (res?.list && Array.isArray(res.list)) {
            resolve(res.list)
            return
          }
          resolve([])
        },
        error: err => {
          console.error(err)
          resolve([])
        }
      })
    })
  }

  async connect (room: number, to?: number): Promise <boolean> {
    return new Promise (resolve => {
      if (!this.handler || !room) {
        resolve(false)
      }

      const message = {
        request: 'join',
        ptype: 'subscriber',
        room,
        streams: [{
          feed: to || room
        }]
      }

      this.handlerInstance?.send({
        message,
        success: () => resolve(true),
        error: () => resolve(false)
      })
    })
  }

  join (to: number): Promise <boolean> {
    return new Promise (resolve => {
      if (!this.handler || !to) {
        resolve(false)
        return
      }

      const message = {
        request: 'join',
        ptype: 'publisher',
        room: to
      }

      this.handlerInstance?.send({
        message,
        success: () => resolve(true),
        error: (err) => {
          console.error(err)
          resolve(false)
        }
      })
    })
  }
  
  unsubscribe (from: number): Promise <boolean> {
    return new Promise (resolve => {
      if (!this.handler || !from) {
        resolve(false)
        return
      }

      const message = {
        request: 'unsubscribe',
        streams: [{
          feed: from
        }]
      }

      this.handlerInstance?.send({
        message,
        success: () => resolve(true),
        error: (err) => {
          console.error(err)
          resolve(false)
        }
      })
    })
  }

  private attach (sdp: JanusJS.JSEP): Promise <true | false> {
    return new Promise (resolve => {
      if (!this.handler) {
        resolve(false)
        return
      }

      const message = {
        request: 'start',
      }

      this.handlerInstance?.send({ 
        message,
        jsep: sdp,
        success: () =>  resolve(true),
        error: (error) => { 
          console.error(error)
          resolve(false)
        }
      })
    })
  }

  async destroySession (): Promise<boolean> {
    return new Promise ((resolve, reject) => {
      this.janusInstance?.destroy({
        cleanupHandles: true,
        notifyDestroyed: true,
        success: () => resolve(true),
        error: () => resolve(false)
      })
    })
  }

   private async createOffer (): Promise <JanusJS.JSEP | false> {
    return new Promise (resolve => {
      
      if (!this.handlerInstance || !this.mediaTracks?.length) {
        resolve(false)
        return
      }

      const tracks: JanusJS.TrackOption[] = this.mediaTracks.map(track => ({
        type: 'video',
        capture: track
      }))
      
      if (!tracks.length) {
        return false
      }

      tracks.push({
        type: 'data',
        capture: false
      })

      this.handlerInstance?.createOffer({
        tracks,
        success: (jsep) => resolve (jsep),
        error: (err) => {
          console.error(err)
          resolve(false)
        }
      })
    })
  }
}
