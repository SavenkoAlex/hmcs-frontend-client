import Janus, { JanusJS } from 'janus-gateway'
import eventEmitter from 'events'
import { 
  StreamHandler,
  StreamDescription
 } from  '@/services/webrtc/webrtcAbstract'

/**
 * WebRTCHandler main functions to control webrtc connection
 */
export interface WebRTCHandler {
  join: (track?: MediaStreamTrack[]) => Promise <boolean>
  leave: () => Promise <boolean>
  requestPrivate?: (subscribers: unknown[], mountId: number) => Promise <boolean>
  sendMessage?: (mes: string) => Promise <boolean>
}

type WebRTCHandlerConstructor = {
  plugin: typeof Janus,
  handler: JanusJS.PluginHandle, 
  emitter: eventEmitter.EventEmitter,
  options: StreamDescription
}

type Publisher = {
  id: number, 
  display: string, 
  publisher: boolean
}

export class SubscriberStreamHandler extends StreamHandler implements  WebRTCHandler { 
  
  private mediaTrack: MediaStreamTrack | null
  private options: StreamDescription
  private publisher: Publisher | null

  private constructor ({
    plugin,
    handler, 
    emitter,
    options
  }: WebRTCHandlerConstructor) {
    super({plugin, handler, emitter})
    this.options = options
    this.mediaTrack = null
    this.publisher = null
  }

  // Static constructor
  static async init <T extends SubscriberStreamHandler> (plugin: typeof Janus, options: StreamDescription) {
    const result = await super.init(plugin)
    if (!result) {
      return null
    }
    const { handler, emitter } = result
    const streamHandler = new SubscriberStreamHandler({plugin, handler, emitter, options})
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
    const publisher = await this.getPublisher()
    
    if (!publisher) {
      return false
    }
    this.publisher = publisher

    const subscriber = await this.joinAsSubscriber()
    return !!subscriber
  }

  async leave () {
    return this.unsubscribe()
  }

  /**
   * Extracts first participant with publisher status
   * @returns 
   */
  private async getPublisher (): Promise <Publisher | null> {
    const publishers = await this.getPublishers()
    if (!publishers || !publishers.length) {
      return null
    }
    
    const activePublishers = publishers.filter(p => p.publisher)
    if (activePublishers.length) {
      return activePublishers[0]
    }

    return null
  }

  private getPublishers (): Promise <Publisher[] | null> {
    return new Promise ((resolve, reject) => {
      if (!this.handler) {
        reject('No plugin handler available')
      }

      const message = {
        request: 'listparticipants',
        room: this.options.mountId
      }

      this.handler?.send({
        message,
        success: (res) => resolve(res.participants as Publisher[]),
        error: err => reject(null)
      })
    })
  }

  private joinAsSubscriber (): Promise <unknown> {
    return new Promise ((resolve, reject) => {
      if (!this.handler) {
        reject('No plugin handler available')
      }

      const message = {
        request: 'join',
        ptype: 'subscriber',
        room: this.options.mountId,
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
