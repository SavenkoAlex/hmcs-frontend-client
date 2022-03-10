import { createStore, Store } from 'vuex'
import { InjectionKey } from 'vue'
import { mutations } from './mutations'
import { getters } from './getters'

export interface State {
  [key: string]: unknown
  defaultStoreMessage: 'Store is working!' | string
}

const devices = {
  state: () => ({}),
  mutations,
  actions: {},
  getters
}

const main = {
  state: () => ({}),
  mutations,
  actions: {},
  getters
}

export const key: InjectionKey <Store<State>> = Symbol('store')

export const store = createStore <State>({
  modules: {
    main,
    devices
  }
})
