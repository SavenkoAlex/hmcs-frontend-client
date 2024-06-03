import { AppState } from '@/types/store'
import { MediaDevice } from '@/types/global'

export const getters = {
  devices: function (state: AppState) {
    return state.devices
  }
}
