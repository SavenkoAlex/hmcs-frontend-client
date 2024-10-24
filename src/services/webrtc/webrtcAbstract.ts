import Janus, { JanusJS } from 'janus-gateway'

import adapter from 'webrtc-adapter'
import eventEmitter from 'events'
import { 
  Handler, 
  InitResult, 
  JanusPlugin,
  HandlerDescription, 
} from '@/types/global'

import { webRTCEventJanusMap, AttachEvent, VIDEO_ROOM_PLUGIN_EVENT } from '@/types/janus'

/** webrtc handler constains plugin handler and event emitter  */
type WebRTCHandlerConstructor = {
  webrtcPlugin: typeof JanusJS.Janus,
  handler: JanusJS.PluginHandle, 
  emitter: eventEmitter.EventEmitter,
}

const webRTCInstance = <T extends Handler> (pluginName: JanusPlugin = JanusPlugin.VITE_WEBRTC_PLUGIN): Promise <InitResult<T>> => {
  const emitter = new eventEmitter.EventEmitter()
  
  return new Promise ((resolve, reject) => {

    const janusInstance = new Janus ({
      server: import.meta.env.VITE_WEBRTC_SERVER,
      error: (err) => reject(err),

      destroyed: () => emitter.emit('destroyed'),
      
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
          
          error: (error) => {
            emitter.emit(webRTCEventJanusMap[AttachEvent.ERROR], error)
          },

          consentDialog: (on) => {
            emitter.emit(webRTCEventJanusMap[AttachEvent.CONSENTDIALOG], on)
          },

          webrtcState: (isConnected) => {
            emitter.emit(webRTCEventJanusMap[AttachEvent.WEBRTCSTATE], isConnected)
          },

          iceState: (state) => {
            emitter.emit(webRTCEventJanusMap[AttachEvent.ICESTATE], state)
          },

          mediaState: (medium, receiving, mid) => {
            emitter.emit(webRTCEventJanusMap[AttachEvent.MEDIASTATE], { medium, receiving, mid })
          },

          slowLink: (uplink, lost, mid) => {
            emitter.emit(webRTCEventJanusMap[AttachEvent.SLOWLINK], { uplink, lost, mid })
          },

          onmessage: (msg: JanusJS.Message , jsep: JanusJS.JSEP | undefined) => {
            emitter.emit(webRTCEventJanusMap[AttachEvent.ONMESSAGE], { msg, jsep })
          },
          
          /**
           * Handles remote track events.
           * 
           * @param {MediaStreamTrack} track - The media stream track.
           * @param {string} mid - The media identifier.
           * @param {boolean} on - Indicates if the track is active.
           * @param {unknown} [metadata] - Optional metadata.
           * @returns {void}
           */
          onremotetrack: (track: MediaStreamTrack, mid: string, on: boolean, metadata?: unknown): void => {
            emitter.emit<{ track: MediaStreamTrack, mid: string, on: boolean, metadata?: unknown }>(
              webRTCEventJanusMap[AttachEvent.ONREMOTETRACK],
              { track, mid, on, metadata }
            );
          },

          onlocaltrack: (track, on) => {
            emitter.emit(webRTCEventJanusMap[AttachEvent.ONLOCALTRACK], { track, on })
          },

          ondata: (data: string) => {
            emitter.emit(webRTCEventJanusMap[AttachEvent.ONDATA], data)
          },
          ondataopen: (label: unknown, protocol: unknown) => {
            emitter.emit(webRTCEventJanusMap[AttachEvent.ONDATAOPEN], label)
          },

          oncleanup: () => {
            emitter.emit(webRTCEventJanusMap[AttachEvent.ONCLEANUP])
          },

          ondetached: () => {
            emitter.emit(webRTCEventJanusMap[AttachEvent.DETACHED])
          }

        } as JanusJS.PluginOptions )
      },
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

  static async init (plugin: typeof Janus, pluginName: JanusPlugin, options?: HandlerDescription): Promise <InitResult <Handler>> {
    if (!plugin) {
      plugin = Janus
    }

    plugin.init({
      debug: true,
      dependencies: Janus.useDefaultDependencies({ adapter }),
    })

    try {
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
