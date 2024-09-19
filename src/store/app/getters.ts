import { AppState } from '@/types/store'

export const getters = {
  devices: function (state: AppState) {
    return state.webrtcSessionId
  }
}
