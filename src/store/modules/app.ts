import { Store, Module } from 'vuex'
import { AppState, State, webrtcSessionId, chatSessionId, WebRTCVideoMountPointState } from '@/types/store'
import { AttachEvent } from '@/types/janus'
import { InjectionKey } from 'vue'
import { actions } from '@/store/app/actions'
import { getters } from '@/store/app/getters'
import { mutations } from '@/store/app/mutations'
import { encryptStorage } from '@/services/secureStoorage'

export const app: Module <AppState, State> = {
  namespaced: true,
  state: {
    webrtcSessionId: <string | number> encryptStorage.getItem(webrtcSessionId) || null,
    chatSessionId: <string | number> encryptStorage.getItem(chatSessionId) || null,
    devices: {},
    performanceNavigationType: null,
    videoErrorState: null,
    isChatHandlerAvailable: false,
    isVideoHandlerAvailable: false,
    [AttachEvent.SUCCESS]: false,
    [AttachEvent.ERROR]: false,
    [AttachEvent.CONSENTDIALOG]: false,
    [AttachEvent.WEBRTCSTATE]: null,
    [AttachEvent.CONNECTIONSTATE]: null,
    [AttachEvent.ICESTATE]: null,
    [AttachEvent.MEDIASTATE]: null,
    [AttachEvent.SLOWLINK]: null,
    [WebRTCVideoMountPointState.STREAM_CONFIGURED]: false,
    [WebRTCVideoMountPointState.STREAM_JOINED]: false,
    [WebRTCVideoMountPointState.STREAM_PUBLISHED]: false
  },
  getters,
  actions,
  mutations
}

export const appStateKey: InjectionKey <Store <AppState>> = Symbol('app')

