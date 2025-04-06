import Janus, { JanusJS } from 'janus-gateway'
import { StreamHandler } from '@/services/webrtc/webrtcAbstract'

 import { 
  JanusPlugin,   
  HandlerDescription,
  WebRTCHandlerConstructor 
} from '@/types/global'

import { TEXT_ROOM_PLUGIN_EVENT, TextRoomPluginError, TextRoomPluginEvent } from '@/types/janus'

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

export class ChatHandler extends StreamHandler {

  private options?: HandlerDescription
  transaction: string
  transactions: Record <string, unknown>

  private constructor({
    webrtcPlugin,
    handler,
    emitter,
    options,
    janusInstance
  }: WebRTCHandlerConstructor) {
    super({webrtcPlugin, handler, emitter, janusInstance})
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
    
    const { handler, emitter, janusInstance } = result

    const chatHandler = new ChatHandler({
      webrtcPlugin,
      handler,
      emitter,
      options: options || undefined,
      janusInstance
    })

    chatHandler.listen()
    return chatHandler
  }

  protected listen(): void {

    this.emitter.on('janus-onmessage', async ({ msg, jsep }) => {
      if (msg.error) {
        this.handlePluginError(msg.error_code)
        return
      }

      if (jsep && msg.textroom) {
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
              error: err => {
                console.error(err)
                this.handlePluginError({
                  error_code: TextRoomPluginError.JANUS_TEXTROOM_ERROR_UNKNOWN_ERROR
                })
              }
            })
          },
          error: err => {
            console.error(err)
            this.handlePluginError({
              error_code: TextRoomPluginError.JANUS_TEXTROOM_ERROR_UNKNOWN_ERROR
            })
          }
        })
        return
      }

      const msgType: TEXT_ROOM_PLUGIN_EVENT = msg.textroom

      if (!msgType) {
        return
      }

      try {
        await this.handlePluginEvent(msgType, msg)
      } catch (err) {
        this.handlePluginError(err)
      }
    })

    this.emitter.on('janus-ondata', data => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        const msgType: TEXT_ROOM_PLUGIN_EVENT = parsed.textroom
        this.handlePluginEvent(msgType, parsed)
      } catch (err) {
        this.handlePluginError(err)
      }
    })
  }

  protected async handlePluginEvent (eventType: TEXT_ROOM_PLUGIN_EVENT | 'event', msg: JanusJS.Message) {
    switch (eventType) {

      case TEXT_ROOM_PLUGIN_EVENT.JOIN:
        this.emitter.emit('text-join')
        break;

      case TEXT_ROOM_PLUGIN_EVENT.SUCCESS:
        this.emitter.emit('text-success', msg)
        break

      case TEXT_ROOM_PLUGIN_EVENT.MESSAGE:
        this.emitter.emit('text-message', { 
          from: msg.from, 
          text: msg.text,
          date: msg.date,
          room: msg.room,
          textroom: msg.textroom
        })
        break

      case TEXT_ROOM_PLUGIN_EVENT.DESTROYED:
        this.emitter.emit('text-destroyed')
        break
      
      case TEXT_ROOM_PLUGIN_EVENT.KICKED:
        this.emitter.emit('text-kicked')
        break
      
      case TEXT_ROOM_PLUGIN_EVENT.EDITED:
        this.emitter.emit('text-edited')
        break
      
      case TEXT_ROOM_PLUGIN_EVENT.LEAVE:
        this.emitter.emit('text-leave')
        break

      case 'event':
        let extendetEventType  = null
        for (const event of Object.values(TextRoomPluginEvent)) {
          if (msg[event]) {
            extendetEventType = event
          }
        }

        if (!extendetEventType) {
          console.warn('unhandled message ', eventType, msg)
          return
        }
        this.emitter.emit(`text-${extendetEventType}`)
        break

      default:
        console.warn('unhandled message ', eventType, msg)
    }
  }

  protected handlePluginError (msg: JanusJS.Message | unknown) {
    let errorCode = TextRoomPluginError.JANUS_TEXTROOM_ERROR_UNKNOWN_ERROR

    if ('error_code' in (msg as JanusJS.Message)) {
      errorCode = (msg as JanusJS.Message).error_code
    }

    switch (errorCode) {

      default:
        this.emitter.emit('janus-error', errorCode)
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
          this.emitter.emit('text-error', response.error)
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
        permanent: false
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
        ack: true,
        text
      }

      let stringified 

      try {
        stringified = JSON.stringify(message) 
      } catch (err) {
        console.error(err)
        resolve(false)
        return
      }

      this.handler.data({
        text: stringified,
        success: (data) => {
          console.log(data); 
          resolve(true)
        },
        error: (err) => { console.error(err); resolve(false) }
      })
    })
  }

  sendPrivateMessage (text: string, to: string, streamId: number): Promise <boolean> {
    return new Promise (resolve => {
      if (!text || !to) {
        resolve(false)
      }

      const message = {
        textroom: 'message',
        transaction: Janus.randomString(12),
        room: streamId,
        tos: to,
        text
      }

      this.handler.data({
        text: JSON.stringify(message),
        error: (err) => { console.error(err); resolve(false) },
        success: () => resolve(true)
      })
    })
  }

  destroyChat (streamId: number): Promise <boolean> {
    
    return new Promise (resolve => {
      const message = {
        textroom: 'destroy',
        room: streamId,
        permanent: false
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
