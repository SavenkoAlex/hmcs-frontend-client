import { AppMutationTypes } from '@/store/app/mutation-types'
import { AppState } from '@/types/store'
import { Maybe } from '@/types/global'

export const mutations = {
  [AppMutationTypes.SET_WEBRTCSESSION_ID]: (state: AppState, payload: Maybe <string | number>) => {
    state.webrtcSessionId = payload 
  },
  [AppMutationTypes.SET_CHATSESSION_ID]: (state: AppState, payload: Maybe <string | number>) => {
    state.chatSessionId = payload 
  },
}
