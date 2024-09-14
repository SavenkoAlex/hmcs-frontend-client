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
  join: (track?: MediaStreamTrack[]) => Promise <boolean>
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
    plugin,
    handler, 
    emitter,
  }: Omit<WebRTCHandlerConstructor, 'options'>) {
    super({plugin, handler, emitter})
    this.mediaTrack = null
    this.publisher = null
  }

  // Static constructor
  static async init (
    plugin: typeof Janus, 
    pluginName: JanusPlugin.VITE_WEBRTC_PLUGIN, 
    options?: HandlerDescription
  ): Promise<SubscriberStreamHandler | null> {
    
    const result = await super.init(plugin, pluginName)
    if (!result) {
      return null
    }
    const { handler, emitter } = result
    const streamHandler = new SubscriberStreamHandler({plugin, handler, emitter})
    streamHandler.listen()
    return streamHandler
  }

  // attach a event listener on janus events
  protected listen () {
    // Catching Janus on message event
    this.emitter.on('message', ({msg, jsep}: {msg: JanusJS.Message, jsep: JanusJS.JSEP}) => {
      if (jsep) {
        this.handler.createAnswer({
          jsep,
          success: (sdp) => this.connect(sdp)
        })
      }
    })

    this.emitter.on('remotetrack', (track, mid, on, metadata) => {
      this.emitter.emit('track', {
        track,
        mid,
        on,
        metadata
      })
    }) 

  }

  async join () {
    /*
    const publisher = await this.getPublisher()
    
    if (!publisher) {
      return false
    }
    this.publisher = publisher

    const subscriber = await this.joinAsSubscriber()
    return !!subscriber
    */

    return true
  }

  async leave () {
    return this.unsubscribe()
  }

  /**
   * Extracts first participant with publisher status
   * @returns 
   */
  private async getPublisher (): Promise <Publisher | null> {
    /*
    const publishers = await this.getPublishers()
    if (!publishers || !publishers.length) {
      return null
    }
    
    const activePublishers = publishers.filter(p => p.room)
    if (activePublishers.length) {
      return activePublishers[0]
    }
    */
    return null
  }

  getPublishers (): Promise <Room[] | null> {

    return new Promise((resolve, reject) => {
      if (!this.handler) {
        reject('No plugin handler available')
      }

      const message = {
        request: 'list',
      }

      this.handler?.send({
        message,
        success: (res) => resolve(res.list as Room[]),
        error: err => reject(null)
      })
    })
    /*
    return new Promise ((resolve, reject) => {
      if (!this.handler) {
        reject('No plugin handler available')
      }

      const message = {
        request: 'listparticipants',
        room: this.options.streamId
      }

      this.handler?.send({
        message,
        success: (res) => resolve(res.participants as Publisher[]),
        error: err => reject(null)
      })
    })
      */
    return Promise.resolve(null)
    
  }

  private joinAsSubscriber (): Promise <unknown> {
    return Promise.resolve(null)
    /*
    return new Promise ((resolve, reject) => {
      if (!this.handler) {
        reject('No plugin handler available')
      }

      const message = {
        request: 'join',
        ptype: 'subscriber',
        room: this.options.streamId,
        streams: [{
          feed: this.publisher?.id
        }]
      }

      this.handler?.send({
        message,
        success: result => resolve(result),
        error: err => reject(err)
      })
    })
    */
  }

  private unsubscribe (): Promise <boolean> {
    return new Promise ((resolve, reject) => {
      if (!this.handler) {
        reject('No plugin handler available')
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
        error: () => reject(false)
      })
    })
  }

  private connect (sdp: JanusJS.JSEP): Promise <true | false> {
    return new Promise ((resolve, reject) => {
      if (!this.handler) {
        reject('No plugin available')
        return
      }

      const message = {
        request: 'start',
      }

      this.handler.send({ 
        message,
        jsep: sdp,
        success: (data) =>  resolve(true),
        error: (error) => resolve(false)
        })
    })
  }
}
