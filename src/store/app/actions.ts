import { ActionContext } from 'vuex'
import { State, AppState } from '@/types/store'
import { Maybe, MediaDevice } from '@/types/global'
import { AppMutationTypes } from '@/store/app/mutation-types'

type AppActionContext = ActionContext <AppState, State>

export const actions = {

  setWebrtcSessionId(context: AppActionContext, payload: Maybe <string | number>) {
    context.commit(AppMutationTypes.SET_WEBRTCSESSION_ID, payload)
  },

  setChatSessionId(context: AppActionContext, payload: Maybe <string | number>) {
    context.commit(AppMutationTypes.SET_CHATSESSION_ID, payload)
  },

  setDevice(context: AppActionContext, payload: MediaDevice) {
    context.commit(AppMutationTypes.SET_DEVICE, payload)
  },

  clearDevices(context: AppActionContext) {
    context.commit(AppMutationTypes.REMOVE_ALL_DEVICES)
  }
}
