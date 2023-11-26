import Janus, { JanusJS } from 'janus-gateway'
import eventEmitter from 'events'
import { 
  StreamHandler,
  StreamDescription
 } from  '@/services/webrtc/webrtcAbstract'

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
  createStream: (track: MediaStreamTrack) => Promise <boolean>
  destroyStream: (mountId: number) => Promise <boolean>
  modifyToPrivate?: (subscribers: unknown[], mountId: number) => Promise <boolean>
  modifyToPublic?: (mointId: number) => Promise <boolean>
}

type WebRTCHandlerConstructor = {
  plugin: typeof Janus,
  handler: JanusJS.PluginHandle, 
  emitter: eventEmitter.EventEmitter,
  options: StreamDescription
}

export class PublisherStreamHandler extends StreamHandler implements  WebRTCHandler { 
  
  roomNumber: number | null
  mediaTrack: MediaStreamTrack | null
  options: StreamDescription

  private constructor ({
    plugin,
    handler, 
    emitter,
    options
  }: WebRTCHandlerConstructor) {
    super({plugin, handler, emitter})
    this.roomNumber = null
    this.options = options
    this.mediaTrack = null
  }

  // Static constructor
  static async init <T extends PublisherStreamHandler> (plugin: typeof Janus, options: Required<StreamDescription>) {
    const result = await super.init(plugin)
    if (!result) {
      return null
    }
    const { handler, emitter } = result
    const streamHandler = new PublisherStreamHandler({plugin, handler, emitter, options})
    streamHandler.listen()
    return streamHandler
  }

  // attach a event listener on janus events
  protected listen () {
    // Catching Janus on message event
    this.emitter.on('message', ({msg, jsep}: {msg: JanusJS.Message, jsep: JanusJS.JSEP}) => {
      const msgType = msg.videoroom
      if (msgType === 'joined') {
        this.createOffer().then(jsep => {
          if (jsep) {
            this.publish(jsep)
          } else {
            console.error('offer is not create')
            return
          }
        })
      }
      
      if (jsep) {
        this.handler.handleRemoteJsep({ jsep })
      }
    })

  }


  /**
   * Send create room request 
   * @returns { number | false } room number or false in case of fail
   */
  private createRoom (options: Pick <StreamDescription, 'mountId' | 'displayName'>): Promise <number | false> {
    return new Promise ((resolve, reject) => {
      if (!this.handler) {
        reject('No plugin available')
      }

      const message = {
        request: 'create',
        room: options.mountId,
        description: options.displayName,
        permanent: false
      }

      this.handler?.send({
        message,
        success: (roomNumber) => {
          resolve(roomNumber)
        },
        error: (err) => {
          console.error('Error requested room creating', err)
          resolve(false)
        }
      })
    })
  }

  /**
   * send join request as publisher (ptype = 'publisher') 
   * @param options stream sys data
   * @returns true or false depending on response
   */
  private joinAsPublisher (): Promise <true | false> {
    return new Promise ((resolve, reject) => {
      if (!this.handler) {
        reject('No plugin available')
      }

      const message = {
        request: 'join',
        ptype: 'publisher',
        room: this.options.mountId,
        id: this.options.mountId,
        display: this.options.displayName
      }

      this.handler?.send({
        message,
        success: () => resolve(true),
        error: () => resolve(false)
      })
    })
  }
  
  /**
   * 
   * @param jsep 
   * @returns 
   */
  private async publish (jsep: JanusJS.JSEP): Promise <true | false> {

    return new Promise ((resolve, reject) => {
      if (!this.handler) {
        reject('No plugin available')
      }

      const message = {
        request: 'publish',
        display: this.options.displayName,
        audio: false,
        video: true,
        descriptions: [{
          mid: this.options.streamId || String(0),
          description: `${this.options.streamId} stream`
        }]
      }

      this.handler?.send({
        message,
        jsep,
        success: () =>  resolve(true),
        error: (err) => { console.log(err); resolve(false) }
      })
    })
  }

  private async createOffer (): Promise <JanusJS.JSEP | false> {
    return new Promise ((resolve, reject) => {
      
      if (!this.handler || !this.mediaTrack) {
        reject('No plugin available')
        return
      }

      this.handler?.createOffer({
        tracks: [{
          type: 'video',
          capture: this.mediaTrack
        }],
        success: (jsep) => resolve (jsep),
        error: () => resolve(false)
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
    this.mediaTrack = track

    const roomNumber = await this.createRoom({ 
      mountId: this.options.mountId, 
      displayName: this.options.displayName 
    })

    if (!roomNumber) {
      console.error('room is not available')
      return false
    }

    const result = await this.joinAsPublisher()
    return result
  }

  async destroyStream (): Promise<boolean> {
    return new Promise ((resolve, reject) => {
        if (!this.handler) {
          reject('No plugin available')
        }

        const message = {
          request: 'destroy',
          room: this.options.mountId,
        }

        this.handler?.send({
          message,
          success: () => resolve(true),
          error: () => resolve(false)
        })
      })
  }

}
