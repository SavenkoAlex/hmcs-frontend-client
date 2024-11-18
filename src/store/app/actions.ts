import { ActionContext } from 'vuex'
import { State, AppState } from '@/types/store'
import { Maybe, MediaDevice, VideoErrorHanlerEvent, errorRetryNumber} from '@/types/global'
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
  },

  setPerformanceNavigationType (context: AppActionContext, payload: NavigationTimingType | null) {
    context.commit(AppMutationTypes.PERWFORMANCE_NAVIGATION_TYPE, payload)
  },

  setVideoErrorState (context: AppActionContext, payload: VideoErrorHanlerEvent | null) {
    if (!payload) {
      context.commit(AppMutationTypes.SET_VIDEO_ERROR_STATE, payload)
      return
    }

    if (payload !== context.state.videoErrorState?.state) {
      context.commit(AppMutationTypes.SET_VIDEO_ERROR_STATE, { state: payload, retry: 0 })
      return
    }

    const retry = context.state.videoErrorState.retry + 1
      
    if (retry > (import.meta.env.RETRY_NUMBER || errorRetryNumber)) {
      context.commit(AppMutationTypes.SET_VIDEO_ERROR_STATE, { state: VideoErrorHanlerEvent.LIMIT_REACHED, retry })
      return
    }
    
    context.commit(AppMutationTypes.SET_VIDEO_ERROR_STATE, { state: payload, retry })
  }
}
