import { AppMutationTypes } from '@/store/app/mutation-types'
import { AppState } from '@/types/store'
import { MediaDevice } from '@/types/global'
import { Payload } from 'vuex'

export const mutations = {
  [AppMutationTypes.SET_CAMERA]: (state: AppState, payload: Payload & MediaDevice) => {
    state.cameras[payload.deviceId] = payload 
  },

  [AppMutationTypes.REMOVE_ALL_CAMERAS]: (state: AppState) => {
    state.cameras = {}
  }
}
