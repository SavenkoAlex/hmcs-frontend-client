import { Store, Module } from 'vuex'
import { AppState, State, webrtcSessionId } from '@/types/store'
import { InjectionKey } from 'vue'
import { actions } from '@/store/app/actions'
import { getters } from '@/store/app/getters'
import { mutations } from '@/store/app/mutations'
import { encryptStorage } from '@/services/secureStoorage'

export const app: Module <AppState, State> = {
  namespaced: true,
  state: {
    webrtcSessionId: <string | number> encryptStorage.getItem(webrtcSessionId) || null
  },
  getters,
  actions,
  mutations
}

export const appStateKey: InjectionKey <Store <AppState>> = Symbol()

