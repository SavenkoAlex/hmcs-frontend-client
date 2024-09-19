import { AppState } from '@/types/store'

export const getters = {
  webrtcSessionId: function (state: AppState) {
    return state.webrtcSessionId
  },
  chatSessionID: function (state: AppState) {
    return state.chatSessionId
  }
}
