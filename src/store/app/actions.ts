import { ActionContext } from 'vuex'
import { State, AppState } from '@/types/store'
import { MediaDevice } from '@/types/global'
import { AppMutationTypes } from '@/store/app/mutation-types'

type AppActionContext = ActionContext <AppState, State>

export const actions = {

  setCameras(context: AppActionContext, payload: MediaDevice) {
    context.commit(AppMutationTypes.SET_CAMERA, payload)
  },

  clearCameras(context: AppActionContext) {
    context.commit(AppMutationTypes.REMOVE_ALL_CAMERAS)
  }
}
