import { createStore, Store } from 'vuex'
import { InjectionKey } from 'vue'
import { mutations } from './mutations'
import { mainGetters, deviceGetters } from './getters'

export interface MainState {
  defaultStoreMessage: 'Main store is working!' | string
  menuItems: {path: string, label: string}[]
}

export interface DeviceState {
  defaultStoreMessage: 'Device store is working!' | string
}

export interface State {
  main: MainState,
  devices: DeviceState
}

const devices = {
  namespace: true,
  mutations,
  actions: {},
  deviceGetters
}

const main = {
  state: () => ({}),
  mutations,
  actions: {},
  mainGetters
}

export const key: InjectionKey <Store<State>> = Symbol('store')

export const store = createStore({
  modules: {
    main,
    devices
  }
})
