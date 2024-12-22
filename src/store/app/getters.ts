import { AttachEvent } from '@/types/janus'
import { AppState, WebRTCVideoMountPointState } from '@/types/store'

export const getters = {
  webrtcSessionId: function (state: AppState) {
    return state.webrtcSessionId
  },
  chatSessionId: function (state: AppState) {
    return state.chatSessionId
  },
  devices: function (state: AppState) {
    return state.devices
  },

  performanceNavigationType: function (state: AppState) {
    return state.performanceNavigationType
  },

  videoErrorState: function (state: AppState) {
    return state.videoErrorState
  },

  isChatHandlerAvailable: function (state: AppState) {
    return state.isChatHandlerAvailable
  },

  isVideoHandlerAvailable: function (state: AppState) {
    return state[AttachEvent.SUCCESS] && !state[AttachEvent.ERROR]
  },

  webrtcState: function (state: AppState) {
    return state[AttachEvent.WEBRTCSTATE]
  },

  connectionState: function (state: AppState) {
    return state[AttachEvent.CONNECTIONSTATE]
  },

  iceSate: function (state: AppState) {
    return state[AttachEvent.ICESTATE]
  },

  mediaState: function (state: AppState) {
    return state[AttachEvent.MEDIASTATE]
  },

  slowLink: function (state: AppState) {
    return state[AttachEvent.SLOWLINK]
  },

  [WebRTCVideoMountPointState.STREAM_CONFIGURED]: function (state: AppState) {
    return state[WebRTCVideoMountPointState.STREAM_CONFIGURED]
  },

  [WebRTCVideoMountPointState.STREAM_JOINED]: function (state: AppState) {
    return state[WebRTCVideoMountPointState.STREAM_JOINED]
  },

  [WebRTCVideoMountPointState.STREAM_PUBLISHED]: function (state: AppState) {
    return state[WebRTCVideoMountPointState.STREAM_PUBLISHED]
  }
}
