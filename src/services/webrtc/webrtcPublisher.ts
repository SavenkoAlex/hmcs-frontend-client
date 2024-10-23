import Janus, { JanusJS } from 'janus-gateway'
import { StreamHandler } from  '@/services/webrtc/webrtcAbstract'
import { 
  JanusPlugin,   
  HandlerDescription,
  WebRTCHandlerConstructor 
} from '@/types/global'

import { PLUGIN_EVENT } from '@/types/janus'
/**
 * Some WebRTC plugin with init (activate) function
 */
export interface WebRTCPlugin <T extends Record <string, unknown>, P extends Record <string, unknown>> {
  init: (options?: T) => void | boolean
  getHandler?: Promise <P>
}

/**
 * WebRTCHandler main functions to control webrtc connection
 */
export interface WebRTCHandler {
  createStream: (track: MediaStreamTrack, mountPoint: number) => Promise <boolean>
  destroyStream: (mountId: number) => Promise <boolean>
  modifyToPrivate?: (subscribers: unknown[], mountId: number) => Promise <boolean>
  modifyToPublic?: (mointId: number) => Promise <boolean>
}



export class PublisherStreamHandler extends StreamHandler implements  WebRTCHandler { 
  
  roomNumber: number | null
  mediaTrack: MediaStreamTrack | null
  options: HandlerDescription

  private constructor ({
    webrtcPlugin,
    handler, 
    emitter,
    options
  }: Required<WebRTCHandlerConstructor>) {
    super({webrtcPlugin, handler, emitter})
    this.roomNumber = null
    this.options = options
    this.mediaTrack = null
  }

  // Static constructor
  static async init (webrtcPlugin: typeof Janus, pluginName: JanusPlugin, options: HandlerDescription) {
    try {
      const result = await super.init(webrtcPlugin, pluginName)
      if (!result) {
        return null
      }
      const { handler, emitter } = result
      const streamHandler = new PublisherStreamHandler({webrtcPlugin, handler, emitter, options})
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
    this.emitter.on('message', async ({msg, jsep}: {msg: JanusJS.Message, jsep: JanusJS.JSEP}) => {
      if (msg.error) {
        console.error(msg.error)
        this.emitter.emit('error', msg.error)
        return
      }

      if (jsep) {
        this.handler.handleRemoteJsep({ jsep })
        return
      }
      
      const eventType: PLUGIN_EVENT = msg.videoroom

      try {
        await this.handlePluginEvent(eventType)
      } catch (err) {
        console.error(err)
        this.emitter.emit('error', err)
      }
    })

    this.emitter.on('event', (event) => {
      this.emitter.emit('event', event)
    })

    this.emitter.on('destroyed', (event) => {
      this.emitter.emit('destroyed', event) 
    })
  }

  protected async handlePluginEvent (eventType: PLUGIN_EVENT) {
    switch (eventType) {
      case PLUGIN_EVENT.PUB_JOINED:
        const jsep = await this.createOffer()
        if (!jsep) {
          this.emitter.emit('error', 'answer is not created')
          console.error('offer is not created')
          return 
        }
        const publishResult = await this.publish(jsep)
        if (publishResult) {
          this.emitter.emit('startstream')
        } else {
          this.emitter.emit('error', 'publishing failed')
        }
        break

      case PLUGIN_EVENT.CREATED:
        this.emitter.emit('roomcreated')
        break

      default:
        console.warn('unhandled message ', eventType)
    }
  }

  /**
   * Send create room request 
   * @returns { number | false } room number or false in case of fail
   */
  private createRoom (): Promise <number | false> {
    return new Promise (resolve => {
      if (!this.handler) {
        resolve(false)
        return
      }

      const message = {
        request: 'create',
        room: this.options.roomId,
        description: this.options.displayName,
        permanent: true
      }

      this.handler?.send({
        message,
        success: (response) => {
          if (response?.room) {
            resolve(response.room)
            return
          }
          // resolve sensible description like room exists
          resolve(false)
        },
        error: (err) => {
          console.error(err)
          resolve(false)
        }
      })
    })
  }

  /**
   * send join request as publisher (ptype = 'publisher') 
   * @param options stream sys data
   * @returns true or false depending on request is sended (but does not mean join successfully)
   */
  private joinAsPublisher (): Promise <boolean> {
    return new Promise (resolve => {
      if (!this.handler) {
        resolve(false)
        return
      }

      const message = {
        request: 'join',
        ptype: 'publisher',
        room: this.options.roomId,
        id: this.options.roomId,
        display: this.options.displayName
      }

      this.handler?.send({
        message,
        success: () => {
          resolve(true)
        },
        error: (err) => {
          console.error(err)
          resolve(false)
        } 
      })
    })
  }
  
  /**
   * 
   * @param jsep 
   * @returns 
   */
  private async publish (jsep: JanusJS.JSEP, mediaId?: string): Promise <boolean> {

    return new Promise (resolve => {
      if (!this.handler || !this.options.roomId) {
        resolve(false)
        return
      }

      const message = {
        request: 'publish',
        display: this.options.displayName,
        audio: true,
        video: true,
        descriptions: [{
          // media id?
          mid: mediaId || '0',
          description: `${this.options.displayName} stream`
        }]
      }

      this.handler?.send({
        message,
        jsep,
        success: () =>  resolve(true),
        error: (err) => { 
          console.error(err)
          resolve(false) 
        }
      })
    })
  }

  private async createOffer (): Promise <JanusJS.JSEP | false> {
    return new Promise (resolve => {
      
      if (!this.handler || !this.mediaTrack) {
        resolve(false)
        return
      }

      this.handler?.createOffer({
        tracks: [{
          type: 'video',
          capture: this.mediaTrack
        },{
          type: 'data',
          capture: false
        }],
        success: (jsep) => resolve (jsep),
        error: (err) => {
          console.error(err)
          resolve(false)
        }
      })
    })
  }

  /**
   * starts publishing stream
   * @param options 
   * @returns 
   */
  async createStream (track: MediaStreamTrack): Promise <boolean> {

    if (!track) {
      console.error('no media stream track detected')
      return false
    }

    try {
      this.mediaTrack = track
      const roomNumber = await this.createRoom()

      if (!roomNumber) {
        console.error('room is not available')
        return false
      }

      const result = await this.joinAsPublisher()
      return result
    } catch (err) {
      console.error(err)
      return false
    }
  }

  async destroyStream (): Promise<boolean> {
    return new Promise (resolve => {
      if (!this.handler) {
        resolve(false)
      }

      const message = {
        request: 'destroy',
        room: this.options.roomId,
        permanent: true
      }

      this.handler?.send({
        message,
        success: () => resolve(true),
        error: () => resolve(false)
      })
    })
  }
}
