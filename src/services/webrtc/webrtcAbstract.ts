import Janus, { JanusJS } from 'janus-gateway'

import adapter from 'webrtc-adapter'
import eventEmitter from 'events'
import { WebRTCStateController } from '@/services/VideoServerErrorStateController/WebRTCStateController'
import { 
  Handler, 
  InitResult, 
  JanusPlugin,
  HandlerDescription, 
} from '@/types/global'

import { webRTCEventJanusMap, AttachEvent, VideoRoomPluginError, VIDEO_ROOM_PLUGIN_EVENT } from '@/types/janus'

/** webrtc handler constains plugin handler and event emitter  */
type WebRTCHandlerConstructor = {
  webrtcPlugin: typeof JanusJS.Janus,
  handler: JanusJS.PluginHandle, 
  emitter: eventEmitter.EventEmitter,
}

const stateController = new WebRTCStateController()

const webRTCInstance = <T extends Handler> (pluginName: JanusPlugin = JanusPlugin.VITE_WEBRTC_PLUGIN): Promise <InitResult<T>> => {
  const emitter = new eventEmitter.EventEmitter()
  
  return new Promise ((resolve, reject) => {


    const janusInstance = new Janus ({
      server: import.meta.env.VITE_WEBRTC_SERVER,
      iceServers: [{ urls: import.meta.env.VITE_STUN_SERVER_1 }, { urls: import.meta.env.VITE_STUN_SERVER_2 }],
      error: (err) => {
        //emitter.emit(webRTCEventJanusMap[AttachEvent.ERROR], VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN)
        stateController.setPluginState(AttachEvent.ERROR, true)
        console.error(err)
      },

      destroyed: () => emitter.emit(webRTCEventJanusMap['destroyed']),
      
      success: () => {
        if (!janusInstance) {
          stateController.setPluginState(AttachEvent.SUCCESS, false)
          stateController.setPluginState(AttachEvent.ERROR, true)
        }

        janusInstance.attach({
          plugin: pluginName,
          
          success: (janusHandler) => { 
            janusHandler.send({ message: { request: 'setup' } })
            resolve({ handler: janusHandler as T, emitter }) 
            stateController.setPluginState(AttachEvent.SUCCESS, true)
          },
          
          error: (error) => {
            stateController.setPluginState(AttachEvent.ERROR, true)
            //emitter.emit(webRTCEventJanusMap[AttachEvent.ERROR], error)
          },

          consentDialog: (on) => {
            stateController.setPluginState(AttachEvent.CONSENTDIALOG, on)
            //emitter.emit(webRTCEventJanusMap[AttachEvent.CONSENTDIALOG], on)
          },

          /**this callback is triggered with a true value when the PeerConnection associated to a handle becomes active (so ICE, DTLS and everything else succeeded) 
           * from the Janus perspective, while false is triggered when the PeerConnection goes down instead; 
           * useful to figure out when WebRTC is actually up and running between you and Janus (e.g., to notify a user they're actually now active in a conference); 
           * notice that in case of false a reason string may be present as an optional parameter; 
           */
          webrtcState: (isConnected) => {
            stateController.setPluginState(AttachEvent.WEBRTCSTATE, isConnected)
            //emitter.emit(webRTCEventJanusMap['webrtcState'], isConnected)
          },

          /** this callback is triggered when the connection state for the PeerConnection associated to the handle changes: 
           * the argument of the callback is the new state as a string (e.g., "connected" or "failed"); 
           */
          connectionState: (state: 'connected' | 'failed') => {
            stateController.setPluginState(AttachEvent.CONNECTIONSTATE, state)
            //emitter.emit(webRTCEventJanusMap['onConnectionState'], state)
          },

          /**
           * @param state this callback is triggered when the ICE state for the PeerConnection associated 
           * to the handle changes: the argument of the callback is the new state as a string (e.g., "connected" or "failed");
           */
          iceState: (state) => {
            stateController.setPluginState(AttachEvent.ICESTATE, state)
            //emitter.emit(webRTCEventJanusMap[AttachEvent.ICESTATE], state)
          },
          /** this callback is triggered when Janus starts or stops receiving your media: for instance, 
           * a mediaState with mid=0, type=audio and on=true means Janus started receiving the audio stream identified by mid b in the offer/answer 
           * exchange and transceivers (or started getting them again after a pause of more than a second); 
           * a mediaState with type=video and on=false means Janus hasn't received any video from you in the last second, 
           * after a start was detected before; useful to figure out when Janus actually started handling your media, 
           * or to detect problems on the media path (e.g., media never started, or stopped at some time); 
           */
          mediaState: (medium, receiving, mid) => {
            stateController.setPluginState(AttachEvent.MEDIASTATE, {medium, receiving, mid})
            //emitter.emit(webRTCEventJanusMap[AttachEvent.MEDIASTATE], { medium, receiving, mid })
          },

          slowLink: (uplink, lost, mid) => {
            //emitter.emit(webRTCEventJanusMap[AttachEvent.SLOWLINK], { uplink, lost, mid })
            stateController.setPluginState(AttachEvent.SLOWLINK, {uplink, lost, mid})
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
  stateController: WebRTCStateController

  protected constructor ({
    webrtcPlugin,
    handler, 
    emitter
    }: WebRTCHandlerConstructor) {
      this.webrtcPlugin = webrtcPlugin
      this.handler = handler
      this.emitter = emitter
      this.stateController = stateController
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
