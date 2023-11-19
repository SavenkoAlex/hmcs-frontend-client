import Janus, { JanusJS } from 'janus-gateway'
import adapter from 'webrtc-adapter'
import eventEmitter from 'events'
import { tr } from 'element-plus/es/locale'

type Handler = JanusJS.PluginHandle

const webRTCInstance = <T extends Handler> (): Promise <{ handler: T, emitter: eventEmitter.EventEmitter}> => {
  const emitter = new eventEmitter.EventEmitter()
  
  return new Promise ((resolve, reject) => {
    const janusInstance = new Janus ({
      server: import.meta.env.webrtc_server,
      success: () => {
        if (!janusInstance) {
          reject('webrtc plugin is not available')
        }

        janusInstance.attach({
          plugin: 'import.meta.env.webrtcplugin',
          success: (janusHandler) => resolve({ handler: janusHandler as T, emitter }),
          onmessage: (msg: JanusJS.Message, jsep: JanusJS.JSEP | undefined) => {
              emitter.emit('message', { msg, jsep })
          },
          onremotetrack: (track: MediaStreamTrack, mid: string, on: boolean, metadata?: unknown) => {
            emitter.emit('remotetrack', track, mid, on, metadata)
          }
        })
      }

    })

  })
}

/**
 * Some WebRTC plugin with init (activate) function
 */
export interface WebRTCPlugin <T extends Record <string, unknown>, P extends Record <string, unknown>> {
  init: (options?: T) => void | boolean
  getHandler?: Promise <P>
}

interface StreamDescription {
  streamId: number
  displayName: string
  mountId: number
  constraints: {
    audio: boolean
    video: boolean
  }
}

/**
 * WebRTCHandler main functions to control webrtc connection
 */
export interface WebRTCHandler {
  createStream: (track: MediaStreamTrack) => Promise <boolean>
  destroyStream: (streamId: number) => Promise <boolean>
  modifyToPrivate?: (subscribers: unknown[], streamId: number) => Promise <boolean>
  modifyToPublic?: (streamId: number) => Promise <boolean>
}

type WebRTCHandlerConstructor = {
  plugin: typeof Janus,
  handler: JanusJS.PluginHandle, 
  emitter: eventEmitter.EventEmitter,
  options: StreamDescription
}

export class StreamHandler implements WebRTCHandler { 
  
  plugin: typeof Janus
  handler: JanusJS.PluginHandle
  emitter: eventEmitter.EventEmitter
  roomNumber: number
  options: StreamDescription
  mediaTrack: MediaStreamTrack | null

  private constructor ({
    plugin,
    handler, 
    emitter,
    options
  }: WebRTCHandlerConstructor) {
    this.plugin = plugin
    this.handler = handler
    this.emitter = emitter
    this.roomNumber = Math.floor(Math.random() * 10000) + Math.floor(Math.random() * 1000)
    this.options = options
    this.mediaTrack = null
  }

  // Static constructor
  static async init (plugin: typeof Janus, options: StreamDescription) {
    plugin.init({
      debug: true,
      dependencies: Janus.useDefaultDependencies({ adapter })
    })

    const { handler, emitter } = await webRTCInstance()
    const streamHandler = new StreamHandler({plugin, handler, emitter, options})
    streamHandler.listen()
  }

  // attach a event listener on janus events
  private listen () {
    // Catching Janus on message event
    this.emitter.on('message', (msg: JanusJS.Message, jsep?: JanusJS.JSEP) => {
      
      if (msg['videoroom'] === 'joined') {
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
      }

      this.handler?.send({
        message,
        success: (roomNumber: number) => {
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
        room: this.roomNumber,
        id: this.options.streamId,
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
        }]
      }

      this.handler?.send({
        message,
        jsep,
        success: () =>  resolve(true),
        error: () => resolve(false)
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

    if (roomNumber !== this.roomNumber) {
      console.error('room number is now match requested room')
      return false
    }

    const result = await this.joinAsPublisher()
    return result
  }

}
