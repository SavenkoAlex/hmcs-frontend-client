import { AppMutationTypes } from '@/store/app/mutation-types'
import { AppState, WebRTCVideoMountPointState } from '@/types/store'
import { ConnectionState, Maybe, MediaDevice, MediaState, SlowLink } from '@/types/global'
import { AttachEvent, VideoRoomPluginError, TextRoomPluginError } from '@/types/janus'
import { Payload } from 'vuex'

export const mutations = {
  [AppMutationTypes.SET_WEBRTCSESSION_ID]: (state: AppState, payload: Maybe <string | number>) => {
    state.webrtcSessionId = payload 
  },
  [AppMutationTypes.SET_CHATSESSION_ID]: (state: AppState, payload: Maybe <string | number>) => {
    state.chatSessionId = payload 
  },
  [AppMutationTypes.SET_DEVICE]: (state: AppState, payload: Payload & MediaDevice) => {
    state.devices[payload.deviceId] = payload 
  },

  [AppMutationTypes.REMOVE_ALL_DEVICES]: (state: AppState) => {
    state.devices = {}
  },

  [AppMutationTypes.PERWFORMANCE_NAVIGATION_TYPE]: (state: AppState, payload: NavigationTimingType | null) => {
    state.performanceNavigationType = payload
  },

  [AppMutationTypes.SET_VIDEO_ERROR_STATE]: (state: AppState, payload: { state: VideoRoomPluginError, retry: number} | null ) => {
    state.videoErrorState = payload
  },

  [AppMutationTypes.SET_IS_CHAT_HANDLER_AVAILABLE]: (state: AppState, payload: boolean) => {
    state.isChatHandlerAvailable = payload
  },

  [AppMutationTypes.SET_IS_VIDEO_HANDLER_AVAILABLE]: (state: AppState, payload: boolean) => {
    state.isVideoHandlerAvailable = payload
  },

  [AppMutationTypes.SET_WEBRTC_PLUGIN_SUCCESS]: (state: AppState, payload: boolean) => {
    state[AttachEvent.SUCCESS] = payload
  },

  [AppMutationTypes.SET_WEBRTC_PLUGIN_ERROR]: (state: AppState, payload: boolean) => {
    state[AttachEvent.ERROR] = payload
  },

  [AppMutationTypes.SET_WEBRTC_PLUGIN_CONSENT_DIALOG]: (state: AppState, payload: boolean) => {
    state[AttachEvent.CONSENTDIALOG] = payload
  },

  [AppMutationTypes.SET_WEBRTC_PLUGIN_WEBRTC_STATE]: (state: AppState, payload: ConnectionState) => {
    state[AttachEvent.WEBRTCSTATE]= payload
  },
  
  [AppMutationTypes.SET_WEBRTC_PLUGIN_ICE_STATE]: (state: AppState, payload: ConnectionState) => {
    state[AttachEvent.ICESTATE] = payload
  },

  [AppMutationTypes.SET_WEBRTC_PLUGIN_MEDIA_STATE]: (state: AppState, payload: MediaState | null) => {
    state[AttachEvent.MEDIASTATE] = payload
  },

  [AppMutationTypes.SET_WEBRTC_PLUGIN_SLOW_LINK]: (state: AppState, payload: SlowLink | null) => {
    state[AttachEvent.SLOWLINK] = payload
  },

  [AppMutationTypes.SET_WEBRTC_PLUGIN_CONNECTION_STATE]: (state: AppState, payload: ConnectionState) => {
    state[AttachEvent.CONNECTIONSTATE] = payload
  },

  [AppMutationTypes.SET_STREAM_STATE_CONFIGURED]: (state: AppState, payload: boolean) => {
    state[WebRTCVideoMountPointState.STREAM_CONFIGURED] = payload
  },
  
  [AppMutationTypes.SET_STREAM_STATE_JOINED]: (state: AppState, payload: boolean) => {
    state[WebRTCVideoMountPointState.STREAM_JOINED] = payload
  },
  
  [AppMutationTypes.SET_STREAM_STATE_PUBLISHED]: (state: AppState, payload: boolean) => {
    state[WebRTCVideoMountPointState.STREAM_PUBLISHED] = payload
  },

  [AppMutationTypes.SET_WEBRTC_CHAT_ERROR]: (state: AppState, payload: TextRoomPluginError) => {
    state.chatErrorState = payload
  }
}
