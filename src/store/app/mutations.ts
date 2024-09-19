import { AppMutationTypes } from '@/store/app/mutation-types'
import { AppState } from '@/types/store'
import { Maybe, MediaDevice } from '@/types/global'
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
  }
}
