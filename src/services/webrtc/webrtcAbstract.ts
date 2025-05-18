import Janus, { JanusJS } from 'janus-gateway'

import adapter from 'webrtc-adapter'
import emitter from '@/services/eventBus'

import { WebRTCStateController } from '@/services/VideoServerErrorStateController/WebRTCStateController'
import { 
  Handler, 
  InitResult, 
  JanusPlugin,
  WebRTCHandlerConstructor
} from '@/types/global'
import { VideoRoomPluginError } from '@/types/janus'

export type Emitter = typeof emitter

const stateController = new WebRTCStateController()

const webRTCInstance = <T extends Handler> (pluginName: JanusPlugin = JanusPlugin.VITE_WEBRTC_PLUGIN): InitResult<T> => {
  
  const events = emitter()
  return {
    emitter: events,
    handler: () => {
      return new Promise (resolve => {
        const janusInstance = new Janus ({
          server: import.meta.env.VITE_WEBRTC_SERVER,
          iceServers: [{ urls: import.meta.env.VITE_STUN_SERVER_1 }, { urls: import.meta.env.VITE_STUN_SERVER_2 }],

          error: (err) => {
            //emitter.emit(webRTCEventJanusMap[AttachEvent.ERROR], VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN)
            //stateController.setPluginState(AttachEvent.ERROR, true)
            events.emit('janus-error', err)
            console.error(err)
          },

          destroyed: () => events.emit('janus-destroyed'),
          
          success: () => {
            if (!janusInstance) {
              //stateController.setPluginState(AttachEvent.SUCCESS, false)
              //stateController.setPluginState(AttachEvent.ERROR, true)
              events.emit('janus-error', VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN_ERROR)
            }

            janusInstance.attach({
              plugin: pluginName,
              
              success: (janusHandler) => { 
                janusHandler.send({ message: { request: 'setup' } })
                resolve({janusHandler, janusInstance} as {janusHandler: T, janusInstance: Janus}) 
                events.emit('janus-success', true)
                console.log('success')
                // stateController.setPluginState(AttachEvent.SUCCESS, true)
              },
              
              error: (error) => {
                //stateController.setPluginState(AttachEvent.ERROR, true)
                //emitter.emit(webRTCEventJanusMap[AttachEvent.ERROR], error)
                console.error(error)
                console.log('error')
                events.emit('janus-error', 499)
              },

              consentDialog: (on) => {
                //stateController.setPluginState(AttachEvent.CONSENTDIALOG, on)
                //emitter.emit(webRTCEventJanusMap[AttachEvent.CONSENTDIALOG], on)
                console.log('consentDialog')
                events.emit('janus-consentDialog', on)
              },

              /**this callback is triggered with a true value when the PeerConnection associated to a handle becomes active (so ICE, DTLS and everything else succeeded) 
               * from the Janus perspective, while false is triggered when the PeerConnection goes down instead; 
               * useful to figure out when WebRTC is actually up and running between you and Janus (e.g., to notify a user they're actually now active in a conference); 
               * notice that in case of false a reason string may be present as an optional parameter; 
               */
              webrtcState: (isConnected) => {
                console.log('webrtcState', isConnected)
                // stateController.setPluginState(AttachEvent.WEBRTCSTATE, isConnected)
                // emitter.emit(webRTCEventJanusMap['webrtcState'], isConnected)
                events.emit('janus-webrtcState', isConnected)
              },

              /** this callback is triggered when the connection state for the PeerConnection associated to the handle changes: 
               * the argument of the callback is the new state as a string (e.g., "connected" or "failed"); 
               */
              connectionState: (state: 'connected' | 'failed') => {
                console.log('connectionState', state)
                // stateController.setPluginState(AttachEvent.CONNECTIONSTATE, state)
                events.emit('janus-connectionState', state)
              },

              /**
               * @param state this callback is triggered when the ICE state for the PeerConnection associated 
               * to the handle changes: the argument of the callback is the new state as a string (e.g., "connected" or "failed");
               */
              iceState: (state) => {
                console.log('iceState', state)
                // stateController.setPluginState(AttachEvent.ICESTATE, state)
                events.emit('janus-iceState', state)
              },
              /** this callback is triggered when Janus starts or stops receiving your media: for instance, 
               * a mediaState with mid=0, type=audio and on=true means Janus started receiving the audio stream identified by mid b in the offer/answer 
               * exchange and transceivers (or started getting them again after a pause of more than a second); 
               * a mediaState with type=video and on=false means Janus hasn't received any video from you in the last second, 
               * after a start was detected before; useful to figure out when Janus actually started handling your media, 
               * or to detect problems on the media path (e.g., media never started, or stopped at some time); 
               */
              mediaState: (medium, receiving, mid) => {
                console.log('mediaState', { medium, receiving, mid })
                // stateController.setPluginState(AttachEvent.MEDIASTATE, {medium, receiving, mid})
                events.emit('janus-mediaState', { medium, receiving, mid })
              },

              slowLink: (uplink, lost, mid) => {
                events.emit('janus-slowLink', { uplink, lost, mid })
                //stateController.setPluginState(AttachEvent.SLOWLINK, {uplink, lost, mid})
              },

              onmessage: (msg: JanusJS.Message , jsep: JanusJS.JSEP | undefined) => {
                console.log('onmessage', { msg })
                events.emit('janus-onmessage', { msg, jsep })
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
                console.log('onremotetrack', { track, mid, on, metadata })
                events.emit(
                  /*webRTCEventJanusMap[AttachEvent.ONREMOTETRACK], */
                  'janus-onremotetrack',
                  { track, mid, on, metadata }
                );
              },

              onlocaltrack: (track, on) => {
                console.log('onlocaltrack', { track, on })
                events.emit('janus-onlocaltrack', { track, on })
              },

              ondata: (data: string) => {
                console.log('ondata', data)
                events.emit('janus-ondata', data)
              },
              ondataopen: (label: string, protocol: unknown) => {
                console.log('ondataopen', { label, protocol })
                events.emit('janus-ondataopen', label)
              },

              oncleanup: () => {
                console.log('oncleanup')
                events.emit('janus-oncleanup')
              },

              ondetached: () => {
                console.log('ondetached')
                events.emit('janus-ondetached')
              }

            } as JanusJS.PluginOptions )
          }
        })
      })
    }
  }
}

export abstract class StreamHandler {
  handler: () => Promise <{ janusHandler: JanusJS.PluginHandle, janusInstance: Janus } | null>
  emitter: ReturnType<Emitter>
  stateController: WebRTCStateController

  protected constructor ({
    handler, 
    emitter,
    }: Omit<WebRTCHandlerConstructor, 'options'>) {
      this.handler = handler
      this.emitter = emitter
      this.stateController = stateController
    }

  static init (plugin: typeof Janus, pluginName: JanusPlugin, ...args: any[]):  InitResult <Handler> | null {
    if (!plugin) {
      plugin = Janus
    }

    plugin.init({
      debug: true,
      dependencies: Janus.useDefaultDependencies({ adapter }),
    })

    try {
      const instance =  webRTCInstance<Handler>(pluginName)
      return instance
    } catch (err) {
      console.error(err)
      return null
    }

  }

  /**
   * creates a Janus handler
   */
  abstract handle (): Promise <void>
  
  /**
   * Listen to Janus events
   */
  protected abstract listen (): void 
}
