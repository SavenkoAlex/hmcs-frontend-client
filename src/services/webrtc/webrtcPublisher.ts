import Janus, { JanusJS } from 'janus-gateway'
import { StreamHandler, Emitter } from  '@/services/webrtc/webrtcAbstract'

import { 
  JanusPlugin,   
  HandlerDescription,
  WebRTCHandlerConstructor,
  Room
} from '@/types/global'

import { 
  VIDEO_ROOM_PLUGIN_EVENT, 
  VideoRoomPluginError,
  ErrorMessage,
  CustomJanusApiResponse,
  videoRoomPluginEvent
} from '@/types/janus'

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
  connect: (track: MediaStreamTrack, mountPoint: number) => Promise <boolean | CustomJanusApiResponse <any>>
  leave: (destroy?: boolean) => Promise <boolean>
  reconnect: (track: MediaStreamTrack, secret?: string) => Promise <boolean>
  getStreams: () => Promise <Room[]>
  modifyToPrivate?: (subscribers: unknown[], mountId: number) => Promise <boolean>
  modifyToPublic?: (mointId: number) => Promise <boolean>
}

export class PublisherStreamHandler extends StreamHandler implements  WebRTCHandler { 
  
  mediaTrack: MediaStreamTrack | null
  options: HandlerDescription
  private handlerInstance: JanusJS.PluginHandle | null
  private janusInstance: Janus | null
  isHandlerEstbilished = false

  private constructor ({
    handler, 
    emitter,
    options,
  }: Required<WebRTCHandlerConstructor>) {
    super({ handler, emitter })
    this.options = options
    this.mediaTrack = null
    this.handlerInstance = null
    this.isHandlerEstbilished = false
    this.janusInstance = null
  }

  // Static constructor
  static init (webrtcPlugin: typeof Janus, pluginName: JanusPlugin, options: HandlerDescription) {
    try {
      const result = super.init(webrtcPlugin, pluginName, options)

      if (!result) {
        return null
      }

      const { emitter, handler } = result
      const streamHandler = new PublisherStreamHandler({handler, emitter, options})
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
    // the rest of emits MUST be handled on client side at this moment
    this.emitter.on('janus-onmessage', async ({msg, jsep}) => {
      if (msg.error) {
        this.handlePluginError(msg)
        return
      }

      if (jsep && msg.videoroom) {
        this.handlerInstance?.handleRemoteJsep({ jsep })
        if (msg?.configured) {
          // this.stateController.setVideoMauntPointState(VIDEO_ROOM_PLUGIN_EVENT.CONFIGURED, true)
          this.emitter.emit('video-configured', true)
        }
        return
      }

      let eventType: VIDEO_ROOM_PLUGIN_EVENT = msg.videoroom

      try {
        // track plugin events
        await this.handlePluginEvent(eventType, msg)
      } catch (err) {
        console.error(err)
        this.emitter.emit('janus-error', VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN_ERROR)
      }
    })
  }

  protected async handlePluginEvent (eventType: VIDEO_ROOM_PLUGIN_EVENT | 'event', msg: JanusJS.Message) {
    switch (eventType) {

      case VIDEO_ROOM_PLUGIN_EVENT.PUB_JOINED:
        const jsep = await this.createOffer()
        if (!jsep) {
          this.emitter.emit('janus-error', VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN_ERROR)
          console.error('offer is not created')
          return 
        }
        await this.publish(jsep)
        break
      
      case VIDEO_ROOM_PLUGIN_EVENT.PUB_PEER_JOINED:
        this.emitter.emit('video-peer-joined')
        break

      case VIDEO_ROOM_PLUGIN_EVENT.DESTROYED:
        //this.stateController.setVideoMauntPointState(VIDEO_ROOM_PLUGIN_EVENT.CONFIGURED, false)
        this.emitter.emit('video-destroyed')
        console.log('video peer')
        break

      case 'event':
        let extendetEventType  = null
        let extendetEventValue = null
        for (const event of Object.values(videoRoomPluginEvent)) {
          if (msg[event]) {
            extendetEventType = event
            extendetEventValue = msg[event] || null
          }
        }

        if (!extendetEventType) {
          console.warn('unhandled message ', eventType, msg)
          return
        }
        this.emitter.emit(`video-${extendetEventType}`, msg)
        console.log(`video-${extendetEventType} emitted`)
        break

      default:
        console.warn('unhandled message ', eventType, msg)
    }
  }

  protected handlePluginError (msg: JanusJS.Message) {

    const errorCode = msg.error_code
      switch (errorCode) {

      default:
        this.emitter.emit('janus-error', msg?.error_code || VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN_ERROR)
      }

  }

  /**
   * Send create room request 
   * @returns { number | false } room number or false in case of fail
   */
  private createRoom (): Promise <CustomJanusApiResponse<number>> {
    return new Promise (resolve => {
      if (!this.handler) {
        resolve({ 
          success: false, 
        })
        return
      }

      const message = {
        request: 'create',
        room: this.options.roomId,
        description: this.options.displayName,
        permanent: false
      }

      this.handlerInstance?.send({
        message,
        success: (response) => {
          if (response?.room) {
            resolve({
              success: true,
              data: response?.room
            })
            return
          }
          // resolve sensible description like room exists
          resolve({ success: false })
        },
        error: (err) => {
          console.error(err)
          resolve({
            success: false,
            errorCode: (err as unknown as ErrorMessage)?.error_code || VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN_ERROR
          })
        }
      })
    })
  }

  /**
   * send join request as publisher (ptype = 'publisher') 
   * @param options stream sys data
   * @returns true or false depending on request is sended (but does not mean join successfully)
   */
  private joinAsPublisher (id? : number, secret?: string): Promise <boolean> {
    return new Promise (resolve => {
      if (!this.handler) {
        resolve(false)
        return
      }

      const message: {request: 'join'} & {[key: string]: any} = {
        request: 'join',
        ptype: 'publisher',
        room: this.options.roomId,
        display: this.options.displayName,
        id: id || this.options.roomId
      }

      if (secret) {
        message['pin'] = secret
      }

      this.handlerInstance?.send({
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
   * publish media
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

      this.handlerInstance?.send({
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

  private async unpublish (): Promise <boolean> {
     return new Promise (resolve =>{
     if (!this.handler) {
        resolve(false)
        return
      }

      const message = {
        request: 'unpublish',
      }

      this.handlerInstance?.send({
        message,
        success: () =>  resolve(true),
        error: (err) => { 
          console.error(err)
          resolve(false) 
        }
      })
    })
  }

  async destroy (): Promise <boolean> {
    return new Promise (resolve => {
      if (!this.handlerInstance) {
        resolve(false)
      }

      const message = {
        request: 'destroy',
        room: this.options.roomId,
        permanent: false
      }

      this.handlerInstance?.send({
        message,
        success: () => resolve(true),
        error: () => resolve(false)
      })
    })
  }

  private async createOffer (): Promise <JanusJS.JSEP | false> {
    return new Promise (resolve => {
      
      if (!this.handler || !this.mediaTrack) {
        resolve(false)
        return
      }

      this.handlerInstance?.createOffer({
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

  private async makePrivateRoom (secret: string, isPrivate: boolean): Promise <false | string> {
    return new Promise (resolve => {
      if (!this.handler) {
        resolve(false)
        return
      }

      const message = {
        request: 'edit',
        room: this.options.roomId,
        new_pin: secret,
        new_require_pvtid: isPrivate
      }

      this.handlerInstance?.send({
        message,
        success: () => resolve(secret),
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
  async connect (track: MediaStreamTrack, id? : number): Promise <CustomJanusApiResponse <number>> {

    if (!track) {
      console.error('no media stream track detected')
      return {
        success: false,
      }
    }

    this.mediaTrack = track

    try {
      const exists = await this.isRoomExists()

      if (exists) {
        const result = await this.joinAsPublisher(id)
        return {
          success: result,
        }
      } 

      const response = await this.createRoom()

      if (!response?.success) {
        return {
          success: !!response?.success
        }
      }

      // async call just request and wait for response
      const result = await this.joinAsPublisher(id)
      return {
        success: result
      }
    } catch (err) {
      console.error(err)
      return {
        success: false
      }
    }
  }

  async leave (): Promise<boolean> {
     return new Promise(resolve => {
      if (!this.options.roomId || !this.handler) {
        resolve(false)
        return
      }

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

  async isRoomExists (): Promise <boolean> {
    return new Promise(resolve => {
      if (!this.options.roomId || !this.handler) {
        resolve(false)
        return
      }

      const message = {
        request: 'exists',
        room: this.options.roomId
      }
      
      this.handlerInstance?.send({
        message,
        success: (data) => resolve(!!data?.exists),
        error: () => resolve(false)
      })
    })
  }

  /**
   * kicks and rejoin publisher
   * @param track 
   * @param secret 
   * @returns 
   */
  async reJoin (track: MediaStreamTrack, secret?: string): Promise <boolean> {
    return new Promise(resolve => {

      if (!this.handler || !this.options.roomId) {
        resolve(false)
        return
      }

      // return this.joinAsPublisher(secret)
      this.mediaTrack = track
      this.kick(this.options.roomId, secret)
        .then(result => result)
        .then(result => {
          if (result) {
            return this.joinAsPublisher()
          }
        })
        .then(result => {
          resolve(!!result)
        })
    })
  } 
  
  /**
   * kick out of room some user by id
   * @param secret 
   * @returns 
   */
  async kick (userId: number, secret?: string): Promise <boolean> {
    return new Promise (resolve => {
      if (!this.handler || !userId) {
        resolve(false)
        return
      }

      const message = {
        request: 'kick',
        room: this.options.roomId,
        id: userId
      }

      const success = (data: unknown) => {
        console.log(data)
        resolve(!!data)
      }
      const error = () => resolve(false)

      if (secret) {
        this.handlerInstance?.send({
          message: { ...message, ...{ secret } },
          success,
          error
        })
        return
      }

      this.handlerInstance?.send({
        message,
        success,
        error
      })
    })
  }

  async listParticipants (): Promise<unknown[]> {
    return new Promise (resolve => {
      if (!this.handler || !this.options.roomId) {
        resolve([])
        return
      }

      const message = {
        request: 'listparticipants',
        room: this.options.roomId
      }

      this.handlerInstance?.send({
        message,
        success: (data) => resolve(data),
        error: () => resolve([])
      })
    })
  }

  async getStreams (): Promise <Room[]> {

    return new Promise(resolve => {
      if (!this.handlerInstance) {
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

  async createPrivateSession (isPrivate = false): Promise <ReturnType<typeof this.makePrivateRoom>> {
    const secret = crypto.randomUUID()
    if (!secret) {
      return false
    }
    return this.makePrivateRoom(secret, isPrivate)
  }

  async reconnect (track: MediaStreamTrack, secret?: string):  Promise<boolean> {
    return false
  }

  async destroySession (): Promise <boolean> {
    return new Promise ((resolve, reject) => {
      this.janusInstance?.destroy({
        cleanupHandles: true,
        notifyDestroyed: true,
        success: () => resolve(true),
        error: () => resolve(false)
      })
    })
  }

  async createStream () {
    const jsep = await this.createOffer()
    if (!jsep) {
      this.emitter.emit('janus-error', VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN_ERROR)
      console.error('offer is not created')
      return 
    }
    await this.publish(jsep)
  }
}
