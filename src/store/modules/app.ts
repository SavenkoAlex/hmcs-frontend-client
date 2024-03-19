import { Store, Module } from 'vuex'
import { AppState, State } from '@/global/store'
import { InjectionKey } from 'vue'

export const app: Module <AppState, State> = {
  namespaced: true,
  state: {}
}

export const appStateKey: InjectionKey <Store <AppState>> = Symbol()

