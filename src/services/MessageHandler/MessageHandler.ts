export const enum MessageType {
  JOINREQUEST = 'joinrequest',
  REQUESTALLOWED = 'requestallowed',
  REQUESTDECLINED = 'requestdeclined',
  SIMPLEMESSAGE = 'simplemessage'
}

export type UserMessage = {
  type: MessageType
  text?: string
}

export interface IMessageHandler {
  packMessage: (type: MessageType, text?: string) => string | null
  unPackMessage: (text: string) => UserMessage
}

export class MessageHandler {

  static packMessage (type: MessageType, text?: string): string | null {
    try {
      const result = JSON.stringify({ type, text })
      return result
    } catch (err) {
      return null
    }
  }

  static unPackMessage (text: string): UserMessage | null {
    try {
      const result = JSON.parse(text)
      if (!result.type) {
        return null
      }
      return result
    } catch (err) {
      return null
    }
  }
}
