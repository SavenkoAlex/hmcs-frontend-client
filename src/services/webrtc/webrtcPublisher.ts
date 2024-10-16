import Janus, { JanusJS } from 'janus-gateway'
import { StreamHandler } from  '@/services/webrtc/webrtcAbstract'
import { 
  JanusPlugin,   
  HandlerDescription,
  WebRTCHandlerConstructor 
} from '@/types/global'

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
    plugin,
    handler, 
    emitter,
    options
  }: Required<WebRTCHandlerConstructor>) {
    super({plugin, handler, emitter})
    this.roomNumber = null
    this.options = options
    this.mediaTrack = null
  }

  // Static constructor
  static async init (plugin: typeof Janus, pluginName: JanusPlugin, options: HandlerDescription) {
    try {
      const result = await super.init(plugin, pluginName, options)
      if (!result) {
        return null
      }
      const { handler, emitter } = result
      const streamHandler = new PublisherStreamHandler({plugin, handler, emitter, options})
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
    this.emitter.on('message', ({msg, jsep}: {msg: JanusJS.Message, jsep: JanusJS.JSEP}) => {
      console.log('message: ', msg)
      if (msg.error) {
        console.error(msg.error)
        this.emitter.emit('error', msg.error)
        return
      }

      const msgType = msg.videoroom

      if (msgType === 'joined') {

        this.createOffer().then(async jsep => {
          if (jsep) {
            await this.publish(jsep)
          } else {
            console.error('offer is not created')
            return
          }
        })
      }
      
      if (jsep) {
        this.handler.handleRemoteJsep({ jsep })
      }
    })

    this.emitter.on('event', (event) => {
      this.emitter.emit('event', event)
    })

    this.emitter.on('destroyed', (event) => {
      console.log('DESTROYED')
      this.emitter.emit('destroyed', event) 
    })

  }

  /**
   * Send create room request 
   * @returns { number | false } room number or false in case of fail
   */
  private createRoom (options: Pick <HandlerDescription, 'streamId' | 'displayName'>): Promise <number | false> {
    return new Promise ((resolve, reject) => {
      if (!this.handler) {
        reject('No plugin available')
      }

      const message = {
        request: 'create',
        room: options.streamId,
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
  private joinAsPublisher (): Promise <boolean> {
    return new Promise ((resolve, reject) => {
      if (!this.handler) {
        reject('No plugin available')
      }

      const message = {
        request: 'join',
        ptype: 'publisher',
        room: this.options.streamId,
        id: this.options.streamId,
        display: this.options.displayName
      }

      this.handler?.send({
        message,
        success: (data) => resolve(true),
        error: () => resolve(false)
      })
    })
  }
  
  /**
   * Forward stream to RTMP
   * @returns { boolean } 
   */
  async forwardRTP (): Promise <boolean> {
    return new Promise ((resolve, reject) => {
      if (!this.handler) {
        reject('No plugin available')
      }
       
      if (!this.options.streamId) {
        reject('No publisher id provided')
      }

      const message = {
        request: 'rtp_forward',
        room: this.options.streamId,
        publisher_id: this.options.streamId,
        host: '192.168.0.115',
        streams: [{
          mid: '0',
          port: 12121
        }]
      }

      this.handler.send({
        message,
        success: () => resolve(true),
        error: (err) => { console.error('err: ', err); resolve(false) }
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
      if (!this.handler || !this.options.streamId) {
        reject('No plugin available')
      }

      const message = {
        request: 'publish',
        display: this.options.displayName,
        audio: false,
        video: true,
        descriptions: [{
          mid: '0',
          description: `${this.options.streamId} stream`
        }]
      }

      this.handler?.send({
        message,
        jsep,
        success: () =>  resolve(true),
        error: (err) => { console.error('err: ', err); resolve(false) }
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
        },{
          type: 'data',
          capture: false
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

    try {

      this.mediaTrack = track

      const roomNumber = await this.createRoom({ 
        streamId: this.options.streamId, 
        displayName: this.options.displayName 
      })

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
    return new Promise ((resolve, reject) => {
        if (!this.handler) {
          reject('No plugin available')
        }

        const message = {
          request: 'destroy',
          room: this.options.streamId,
        }

        this.handler?.send({
          message,
          success: () => resolve(true),
          error: () => resolve(false)
        })
      })
  }

}
