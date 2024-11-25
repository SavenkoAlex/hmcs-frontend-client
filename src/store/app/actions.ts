import { ActionContext } from 'vuex'
import { State, AppState } from '@/types/store'
import { Maybe, MediaDevice, errorRetryNumber} from '@/types/global'
import { VideoRoomPluginError } from '@/types/janus'
import { AppMutationTypes } from '@/store/app/mutation-types'
import { ErrorController, ErrorStateController } from '@/services/VideoServerErrorStateController/ErrorStateController'

const errorStateController = new ErrorStateController()

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
  },

  setPerformanceNavigationType (context: AppActionContext, payload: NavigationTimingType | null) {
    context.commit(AppMutationTypes.PERWFORMANCE_NAVIGATION_TYPE, payload)
  },

  setVideoErrorState (context: AppActionContext, payload: VideoRoomPluginError | null) {
    if (!payload) {
      context.commit(AppMutationTypes.SET_VIDEO_ERROR_STATE, null)
      return
    }

    const newState = errorStateController.getState(context.state.videoErrorState, payload)
    context.commit(AppMutationTypes.SET_VIDEO_ERROR_STATE, newState)
  }
}
