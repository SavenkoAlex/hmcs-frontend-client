import { AppState } from '@/types/store'
import { MediaDevice } from '@/types/global'

export const getters = {
  cameras: function (state: AppState) {
    return state.cameras
  }
}
