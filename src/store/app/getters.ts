import { AppState } from '@/types/store'

export const getters = {
  webrtcSessionId: function (state: AppState) {
    return state.webrtcSessionId
  },
  chatSessionId: function (state: AppState) {
    return state.chatSessionId
  },
  devices: function (state: AppState) {
    return state.devices
  }
}
