import { Store, Module } from 'vuex'
import { AppState, State } from '@/types/store'
import { InjectionKey } from 'vue'
import { actions } from '@/store/app/actions'
import { getters } from '@/store/app/getters'
import { mutations } from '@/store/app/mutations'

export const app: Module <AppState, State> = {
  namespaced: true,
  state: {
    devices: {}
  },
  getters,
  actions,
  mutations
}

export const appStateKey: InjectionKey <Store <AppState>> = Symbol()

