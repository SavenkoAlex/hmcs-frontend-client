import Janus, { JanusJS } from 'janus-gateway'

import adapter from 'webrtc-adapter'
import eventEmitter from 'events'
import { 
  Handler, 
  InitResult, 
  JanusPlugin,
  HandlerDescription, 
} from '@/types/global'

type WebRTCHandlerConstructor = {
  webrtcPlugin: typeof Janus,
  handler: JanusJS.PluginHandle, 
  emitter: eventEmitter.EventEmitter,
}

const webRTCInstance = <T extends Handler> (pluginName: JanusPlugin = JanusPlugin.VITE_WEBRTC_PLUGIN): Promise <InitResult<T>> => {
  const emitter = new eventEmitter.EventEmitter()
  
  return new Promise ((resolve, reject) => {

    const janusInstance = new Janus ({
      server: import.meta.env.VITE_WEBRTC_SERVER,
      success: () => {
        if (!janusInstance) {
          reject('webrtc plugin is not available')
        }

        janusInstance.attach({
          plugin: pluginName,
          success: (janusHandler) => { 
            janusHandler.send({ message: { request: 'setup' } })
            resolve({ handler: janusHandler as T, emitter }) 
          },
          onmessage: (msg: JanusJS.Message, jsep: JanusJS.JSEP | undefined) => {
            emitter.emit('message', { msg, jsep })
          },
          onremotetrack: (track: MediaStreamTrack, mid: string, on: boolean, metadata?: unknown) => {
            emitter.emit('remotetrack', track, mid, on, metadata)
          },
          ondata: (data: string) => {
            emitter.emit('data', data)
          },
          ondataopen: (label: unknown, protocol: unknown) => {
            emitter.emit('dataopen', label)
          },
        })
      },
      error: (err) => {
        console.error(err)
        reject(err)
      },

      destroyed: () => {
        emitter.emit('destroyed')
      }
    })

  })
}

export abstract class StreamHandler {

  webrtcPlugin: typeof Janus
  handler: JanusJS.PluginHandle
  emitter: eventEmitter.EventEmitter

  protected constructor ({
    webrtcPlugin,
    handler, 
    emitter
    }: WebRTCHandlerConstructor) {
      this.webrtcPlugin = webrtcPlugin
      this.handler = handler
      this.emitter = emitter
    }

  static async init (webrtcPlugin: typeof Janus, pluginName: JanusPlugin, ...args: any[]): Promise <InitResult <Handler>> {
    
    try {
      webrtcPlugin.init({
        debug: true,
        dependencies: Janus.useDefaultDependencies({ adapter }),
      })

      const instance = await webRTCInstance<Handler>(pluginName)

      if (!instance?.handler || !instance?.emitter) {
        return null
      }

      return { handler: instance.handler, emitter: instance.emitter } 
    } catch (err) {
      console.error(err)
      return null
    }
  }

  protected abstract listen (): void 
}
