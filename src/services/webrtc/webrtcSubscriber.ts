import Janus, { JanusJS } from 'janus-gateway'
import { StreamHandler } from  '@/services/webrtc/webrtcAbstract'

 import { 
  HandlerDescription, 
  JanusPlugin,
  WebRTCHandlerConstructor,
  Room
} from '@/types/global'

import { 
  VIDEO_ROOM_PLUGIN_EVENT, 
  VideoRoomPluginError,
} from '@/types/janus'

/**
 * WebRTCHandler main functions to control webrtc connection (subscriber)
 */
export interface WebRTCHandler {
  connect: (to: number, track?: MediaStreamTrack[]) => Promise <boolean>
  leave: (from: number) => Promise <boolean>
  getStreams: () => Promise<Room[] | null>
  requestPrivate?: (subscribers: unknown[], mountId: number) => Promise <boolean>
  sendMessage?: (mes: string) => Promise <boolean>
}


type Publisher = {
  id: number, 
  display: string, 
  publisher: boolean
}

export class SubscriberStreamHandler extends StreamHandler implements  WebRTCHandler { 
  
  private mediaTrack: MediaStreamTrack | null
  private publisher: Publisher | null
  options? : HandlerDescription

  private constructor ({
    webrtcPlugin,
    handler, 
    emitter,
    janusInstance
  }: Omit<WebRTCHandlerConstructor, 'options'>) {
    super({ webrtcPlugin, handler, emitter, janusInstance })
    this.mediaTrack = null
    this.publisher = null
  }

  // Static constructor
  static async init (
    webrtcPlugin: typeof Janus, 
    pluginName: JanusPlugin.VITE_WEBRTC_PLUGIN, 
    options?: HandlerDescription
  ): Promise<SubscriberStreamHandler | null> {
    
    try {
      const result = await super.init(webrtcPlugin, pluginName)

      if (!result) {
        return null
      }
      const { handler, emitter, janusInstance } = result
      const streamHandler = new SubscriberStreamHandler({webrtcPlugin, handler, emitter, janusInstance})
      streamHandler.listen()
      return streamHandler
    } catch (err) {
      console.error(err)
      return null
    }
  }

  // attach a event listener on janus events
  protected listen () {
    // Catching Janus on message event
    this.emitter.on('janus-onmessage', async ({jsep, msg}) => {
      if (msg.error) {
        console.error(msg.error)
        this.emitter.emit('janus-error', msg.error_code || VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN)
        return
      }

      if (jsep) {
        this.handler.createAnswer({
          jsep,
          success: (sdp) => this.attach(sdp)
        })
        return
      }

      const eventType: VIDEO_ROOM_PLUGIN_EVENT = msg.videoroom

      try {
        await this.handlePluginEvent(eventType, msg)
      } catch (err) {
        console.error(err)
        this.emitter.emit('janus-error', err)
      }
    })
  }

  protected async handlePluginEvent (eventType: VIDEO_ROOM_PLUGIN_EVENT, msg: JanusJS.Message) {
    switch (eventType) {
      case VIDEO_ROOM_PLUGIN_EVENT.SUB_JOINED:
        this.emitter.emit('video-subscribed', msg)
        break

      case VIDEO_ROOM_PLUGIN_EVENT.DESTROYED:
        this.emitter.emit('video-destroyed')
        break
      case VIDEO_ROOM_PLUGIN_EVENT.ATTACHED:
        this.emitter.emit('video-attached', msg.streams)
        break

      case VIDEO_ROOM_PLUGIN_EVENT.STARTED:
        if (msg.started) {
          this.emitter.emit('video-started', msg.started === 'ok')
        }
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

      this.handler?.send({
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
      
      this.handler?.send({
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

      this.handler?.send({
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

  async connect (to: number): Promise <boolean> {
    return new Promise (resolve => {
      if (!this.handler) {
        resolve(false)
      }

      const message = {
        request: 'join',
        ptype: 'subscriber',
        room: to,
        streams: [{
          feed: to
        }]
      }

      this.handler?.send({
        message,
        success: () => resolve(true),
        error: () => resolve(false)
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

      this.handler?.send({
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

      this.handler.send({ 
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

  isJanusConnected (): boolean {
    return !!this.janusInstance.isConnected()
  }

  destroySession (): Promise<boolean> {
    return new Promise (resolve => {
      this.janusInstance.destroy({
        success: () => resolve(true),
        error: () => resolve(false),
        cleanupHandles: true,
        notifyDestroyed: true,
        unload: true
      })
    })
  }
}
