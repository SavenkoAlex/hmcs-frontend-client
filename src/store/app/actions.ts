import { ActionContext } from 'vuex'
import { State, AppState } from '@/types/store'
import { ConnectionState, Maybe, MediaDevice, MediaState } from '@/types/global'
import { VideoRoomPluginError, TextRoomPluginError } from '@/types/janus'
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

  setVideoErrorState (context: AppActionContext, payload: VideoRoomPluginError | null) {
    if (!payload) {
      context.commit(AppMutationTypes.SET_VIDEO_ERROR_STATE, null)
      return
    }

    // const newState = errorStateController.getState(context.state.videoErrorState, payload)
    context.commit(AppMutationTypes.SET_VIDEO_ERROR_STATE, true)
  },

  setIsVideoHandlerAvailable (context: AppActionContext, payload: boolean) {
    context.commit(AppMutationTypes.SET_IS_VIDEO_HANDLER_AVAILABLE, payload)
  },

  setIsChatHandlerAvailable (context: AppActionContext, payload: boolean) {
    context.commit(AppMutationTypes.SET_IS_CHAT_HANDLER_AVAILABLE, payload)
  },

  setWebrtcPluginSuccess (context: AppActionContext, payload: boolean) {
    context.commit(AppMutationTypes.SET_WEBRTC_PLUGIN_SUCCESS, payload)
  },

  setWebrtcPluginError (context: AppActionContext, payload: boolean) {
    context.commit(AppMutationTypes.SET_WEBRTC_PLUGIN_ERROR, payload)
  },

  setWebrtcPluginConsentDialog (context: AppActionContext, payload: boolean) {
    context.commit(AppMutationTypes.SET_WEBRTC_PLUGIN_CONSENT_DIALOG, payload)
  },

  setWebrtcPluginWebrtcState (context: AppActionContext, payload: ConnectionState) {
    context.commit(AppMutationTypes.SET_WEBRTC_PLUGIN_WEBRTC_STATE, payload)
  },

  setWebrtcPluginConnectionState (context: AppActionContext, payload: ConnectionState) {
    context.commit(AppMutationTypes.SET_WEBRTC_PLUGIN_CONNECTION_STATE, payload)
  },

  setWebrtcPluginIceState (context: AppActionContext, payload: ConnectionState) {
    context.commit(AppMutationTypes.SET_WEBRTC_PLUGIN_ICE_STATE, payload)
  },

  setWebrtcPluginMediaState (context: AppActionContext, payload: MediaState) {
    context.commit(AppMutationTypes.SET_WEBRTC_PLUGIN_MEDIA_STATE, payload)
  },

  setWebrtcPluginSlowLink (context: AppActionContext, payload: boolean) {
    context.commit(AppMutationTypes.SET_WEBRTC_PLUGIN_SLOW_LINK, payload)
  },

/*************  ✨ Codeium Command ⭐  *************/
/******  a9b75308-0778-4839-9fdb-7dbd8c7f7fe7  *******/
  setStreamConfigured (context: AppActionContext, payload: boolean) {
    context.commit(AppMutationTypes.SET_STREAM_STATE_CONFIGURED, payload)
  },

  setStreamPublished (context: AppActionContext, payload: boolean) {
    context.commit(AppMutationTypes.SET_STREAM_STATE_PUBLISHED, payload)
  },

  setStreamJoined (context: AppActionContext, payload: boolean) {
    context.commit(AppMutationTypes.SET_STREAM_STATE_JOINED, payload)
  },

  setChatError (context: AppActionContext, payload: TextRoomPluginError) {
    context.commit(AppMutationTypes.SET_WEBRTC_CHAT_ERROR, payload)
  }
}
