import Janus, { JanusJS } from 'janus-gateway'
import eventEmitter from 'events'
import { 
  StreamHandler,
 } from  '@/services/webrtc/webrtcAbstract'

 import { 
  HandlerDescription, 
  JanusPlugin,
  WebRTCHandlerConstructor,
  Room
} from '@/types/global'

/**
 * WebRTCHandler main functions to control webrtc connection (subscriber)
 */
export interface WebRTCHandler {
  join: (publisherId: string, roomId: number, track?: MediaStreamTrack[]) => Promise <boolean>
  leave: () => Promise <boolean>
  getPublishers: () => Promise<Room[] | null>
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
  }: Omit<WebRTCHandlerConstructor, 'options'>) {
    super({ webrtcPlugin, handler, emitter })
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
      const { handler, emitter } = result
      const streamHandler = new SubscriberStreamHandler({webrtcPlugin, handler, emitter})
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
    this.emitter.on('message', ({jsep}: {jsep: JanusJS.JSEP}) => {
      if (jsep) {
        this.handler.createAnswer({
          jsep,
          success: (sdp) => this.connect(sdp)
        })
      }
    })

    this.emitter.on('remotetrack', (track, mid, on, metadata) => {
      this.emitter.emit('remotetrack', {
        track,
        mid,
        on,
        metadata
      })
    }) 

  }

  async leave () {
    return this.unsubscribe()
  }

  getPublishers (): Promise <Room[]> {

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

  async join (publisherId: string, roomId: number): Promise <boolean> {
    return new Promise (resolve => {
      if (!this.handler || publisherId) {
        resolve(false)
      }

      const message = {
        request: 'join',
        ptype: 'subscriber',
        room: roomId,
        streams: [{
          feed: roomId
        }]
      }

      this.handler?.send({
        message,
        success: () => resolve(true),
        error: () => resolve(false)
      })
    })
  }

  private unsubscribe (): Promise <boolean> {
    return new Promise (resolve => {
      if (!this.handler) {
        resolve(false)
        return
      }

      const message = {
        request: 'unsubscribe',
        streams: [{
          feed: this.publisher?.id
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

  private connect (sdp: JanusJS.JSEP): Promise <true | false> {
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
}
