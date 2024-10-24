import Janus, { JanusJS } from 'janus-gateway'
import { StreamHandler } from '@/services/webrtc/webrtcAbstract'

 import { 
  JanusPlugin,   
  HandlerDescription,
  WebRTCHandlerConstructor 
} from '@/types/global'

import { TEXT_ROOM_PLUGIN_EVENT, AttachEvent, webRTCEventJanusMap } from '@/types/janus'

/** message type */
export const enum MessageType {
  BROADCAST = 100,
  PRIVATE,
  GROUP,
  JOINREQUEST
}

/** messge data payload in case join request message */
export const enum JOINREQUESTDATA {
  JOINREQUEST = 100,
  REQUESTALLOWED,
  REQUESTDECLINED
}

/** message payload */
export type Message <T extends MessageType>= {
  type: MessageType,
  data: T extends MessageType.JOINREQUEST ? JOINREQUESTDATA : string,
  key: T extends MessageType.PRIVATE ? string : never
} 

export type Participant = {
  username: string
}

export type Response = {
  textroom: string,
  'error_code': number,
  error: string,
  participants: Participant[],
}

/** send message function */
export interface MessageExchange {
  send: <T extends MessageType> (message: Message <T>) => void
  listen: () => void
}

/** janus message signature */
export type JanustMessage = {
  room: number,
  description: string,
  pin_required: boolean,
  num_participants: number,
  history: number
}

/** janus text message  */
export type JanusTextMessage = {
  date?: string //"2024-07-14T14:44:18-0400"
  from: string
  room: number,
  text?: string,
  exists?: boolean,
  textroom: 'message' | 'success'
  transaction?: string
}

transaction: "oorzya5UTd6J"
export class ChatHandler extends StreamHandler {

  private options?: HandlerDescription
  transaction: string
  transactions: Record <string, unknown>

  private constructor({
    webrtcPlugin,
    handler,
    emitter,
    options
  }: WebRTCHandlerConstructor) {
    super({webrtcPlugin, handler, emitter})
    this.transaction = Janus.randomString(12)
    this.transactions = {}
    if (options) {
      this.options = options
    }
  }

  static async init (webrtcPlugin: typeof Janus, pluginName: JanusPlugin, options?: HandlerDescription) {
    const result = await super.init(webrtcPlugin, pluginName)

    if (!result) {
      return null
    }
    
    const { handler, emitter } = result

    const chatHandler = new ChatHandler({
      webrtcPlugin,
      handler,
      emitter,
      options: options || undefined
    })

    chatHandler.listen()
    return chatHandler
  }

  protected listen(): void {
    this.emitter.on(webRTCEventJanusMap[AttachEvent.ONMESSAGE], async ({ msg, jsep }: { msg: JanusJS.Message, jsep: JanusJS.JSEP}) => {
      if (msg.error) {
        this.emitter.emit(webRTCEventJanusMap[AttachEvent.ERROR], msg.error)
        return
      }

      if (jsep) {
        this.handler.createAnswer({
          jsep,
          tracks: [{type: 'data', capture: false}],
          success: (jsep: JanusJS.JSEP) => {
            const message = {
              request: 'ack',
            }

            this.handler.send({ 
              message, 
              jsep, 
              error: err => this.emitter.emit(webRTCEventJanusMap[AttachEvent.ERROR], err)
            })
          },
          error: (err) => this.emitter.emit(webRTCEventJanusMap[AttachEvent.ERROR], err)
        })
        return
      }

      const msgType: TEXT_ROOM_PLUGIN_EVENT = msg.textroom

      try {
        await this.handlePluginEvent(msgType, msg)
      } catch (err) {
        this.emitter.emit(webRTCEventJanusMap[AttachEvent.ERROR], err)
      }
    })

    this.emitter.on(webRTCEventJanusMap[AttachEvent.ONDATA], data => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        if (parsed?.error) {
          this.emitter.emit(webRTCEventJanusMap[AttachEvent.ERROR], parsed.error)
          return
        }
        /** data recieved */
        this.emitter.emit(TEXT_ROOM_PLUGIN_EVENT.DATA, parsed)
      } catch (err) {
        this.emitter.emit(webRTCEventJanusMap[AttachEvent.ERROR], err)
      }
      
    })
  }

  protected async handlePluginEvent (eventType: TEXT_ROOM_PLUGIN_EVENT, msg: JanusJS.Message) {
    switch (eventType) {

      case TEXT_ROOM_PLUGIN_EVENT.JOINED:
        this.emitter.emit(TEXT_ROOM_PLUGIN_EVENT.JOINED)
        break;

      case TEXT_ROOM_PLUGIN_EVENT.SUCCESS:
        console.log('room created', msg)

      default:
        console.warn('unhandled message ', eventType)
    }
  }

  /** register an user in chat */
  register (displayName: string, streamId: number): Promise <boolean> {
    
    return new Promise((resolve) => {

      if (!displayName || !streamId) {
        return false
      }

      const register = {
        textroom: 'join',
        transaction: this.transaction,
        room: streamId,
        username: displayName,
        display: displayName
      }

      this.transactions[this.transaction] = (response: Response) => {
        if (response.error) {
          console.error(response.error)
          this.emitter.emit('error', response.error)
          return
        }
      }

      this.handler.data({
        text: JSON.stringify(register),
        success: () => resolve(true),
        error: (err) => { console.error(err); resolve(false) }
      })
    })
    
  } 

  createRoom (streamId: number): Promise <boolean> {
    return new Promise (resolve => {
      if (!streamId) {
        resolve(false)
      }

      const message = {
        request: 'create',
        room: streamId,
        transaction: this.transaction,
        permanent: true
      }

      this.handler.send({ 
        message,
        error: (err) => resolve(false),
        success: (data) => resolve(true)
      })
    })
  }

  /** send broadcast message */
  sendMessage (text: string, streamId: number): Promise <boolean> {

    return new Promise (resolve => {
      if (!text) {
        resolve(false)
      }

      const message = {
        textroom: 'message',
        transaction: this.transaction,
        room: streamId,
        text
      }

      let stringified 
      try {
        stringified = JSON.stringify(message) 
      } catch (err) {
        console.error(err)
        Promise.resolve(false)
        return
      }

      this.handler.data({
        text: stringified,
        success: () => resolve(true),
        error: (err) => { console.error(err); resolve(false) }
      })
    })
  }

  /** send private massege */
  sendPrivateMessage (text: string, to: string, streamId: number): Promise <boolean> {
    return new Promise (resolve => {
      if (!text || !to) {
        resolve(false)
      }

      const message = {
        textroom: 'message',
        transaction: Janus.randomString(12),
        room: streamId,
        to,
        text
      }

      this.handler.data({
        text: JSON.stringify(message),
        error: (err) => { console.error(err); resolve(false) },
        success: () => resolve(true)
      })
    })
  }

  destroyHandler (streamId: number): Promise <boolean> {
    
    return new Promise (resolve => {
      const message = {
        textroom: 'destroy',
        room: streamId,
        permanent: true
      }

      this.handler.data({
        text: JSON.stringify(message),
        error: (err => { console.error(err); resolve(false) }),
        success: () => resolve(true)
      })
    })
  }

  leave (streamId: number): Promise <boolean> {

    return new Promise (resolve => {
      const message = {
        textroom: 'leave',
        room: streamId
      }

      this.handler.data({
        text: JSON.stringify(message),
        error: (err) => { console.error(err); resolve(false)},
        success: () => resolve(true)
      })
    })
  }

  getRooms (): Promise <boolean> {
    return new Promise (resolve => {

      if (!this.handler) {
        return null
      }

      const message = {
        textroom: 'list',
        transaction: this.transaction
      }

      this.handler.data({
        text: JSON.stringify(message),
        success: () => resolve(true),
        error: err => { console.error(err); resolve(false) }
      })
    })
  }

  exists (streamId: number): Promise <boolean> {
    return new Promise (resolve => {
      if (!this.handler) {
        resolve(false)
        return
      }

      const message = {
        request: 'exists',
        room: streamId,
        transaction: this.transaction
      }

      this.handler.send({
        message,
        success: (data) => resolve(!!(data as {exists: boolean})?.exists),
        error: (err) => resolve(false)
      })
    })
  }
}
