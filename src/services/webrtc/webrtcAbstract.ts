import Janus, { JanusJS } from 'janus-gateway'
import adapter from 'webrtc-adapter'
import eventEmitter from 'events'

export interface StreamDescription {
  streamId?: string
  displayName: string
  mountId: number,
  publisherId?: string
}

type WebRTCHandlerConstructor = {
  plugin: typeof Janus,
  handler: JanusJS.PluginHandle, 
  emitter: eventEmitter.EventEmitter,
}

type Handler = JanusJS.PluginHandle

type initResult <T extends StreamHandler> = null | T | {
  handler: JanusJS.PluginHandle,
  emitter: eventEmitter.EventEmitter
}

const webRTCInstance = <T extends Handler> (): Promise <{ handler: T, emitter: eventEmitter.EventEmitter}> => {
  const emitter = new eventEmitter.EventEmitter()
  
  return new Promise ((resolve, reject) => {
    const server = import.meta.env
    const janusInstance = new Janus ({
      server: import.meta.env.VITE_WEBRTC_SERVER,
      success: () => {
        if (!janusInstance) {
          reject('webrtc plugin is not available')
        }

        janusInstance.attach({
          plugin: import.meta.env.VITE_WEBRTC_PLUGIN,
          success: (janusHandler) => resolve({ handler: janusHandler as T, emitter }),
          onmessage: (msg: JanusJS.Message, jsep: JanusJS.JSEP | undefined) => {
            emitter.emit('message', { msg, jsep })
          },
          onremotetrack: (track: MediaStreamTrack, mid: string, on: boolean, metadata?: unknown) => {
            emitter.emit('remotetrack', track, mid, on, metadata)
          },
        })
      },
      error: (err) => console.error(err)

    })

  })
}

export abstract class StreamHandler {

  plugin: typeof Janus
  handler: JanusJS.PluginHandle
  emitter: eventEmitter.EventEmitter

  protected constructor ({
    plugin,
    handler, 
    emitter
    }: WebRTCHandlerConstructor) {
      this.plugin = plugin
      this.handler = handler
      this.emitter = emitter
    }

  static async init <T extends StreamHandler>(plugin: typeof Janus, options?: StreamDescription): Promise <initResult <T>> {
    plugin.init({
      debug: true,
      dependencies: Janus.useDefaultDependencies({ adapter })
    })

    const { handler, emitter } = await webRTCInstance()
    if (!handler || !emitter) {
      return null
    }
    return { handler, emitter } 
  }

  protected abstract listen (): void 
}
