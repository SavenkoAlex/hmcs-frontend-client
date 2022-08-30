import { createStore, Store, useStore as baseUseStore } from 'vuex'
import { InjectionKey } from 'vue'
import { mutations } from './mutations'
import { mainGetters, deviceGetters } from './getters'

export interface MainState {
  defaultStoreMessage: 'Main store is working!' | string
  menuItems: {path: string, label: string}[]
  user: {
    readonly id: string,
    readonly token: string
  }
}

export interface DeviceState {
  defaultStoreMessage: 'Device store is working!' | string
}

export interface State {
  main: MainState,
  devices: DeviceState
}

export type ModuleState <T extends keyof State> = State[T]

const devices = {
  state: () => ({
    defaultStoreMessage: 'Hoi'
  }),
  mutations,
  actions: {},
  deviceGetters
}

const main = {
  state: () => ({
    defaultStoreMessage: 'Hey'
  }),
  mutations,
  actions: {},
  mainGetters
}

export const keyMain: InjectionKey <Store<State>> = Symbol('main')
export const keyDevices: InjectionKey <Store<State>> = Symbol('devices')

export const store = createStore({
  modules: {
    main,
    devices
  }
})

export function useStore (key?: keyof State): Store <State> {
  switch (key) {
    case 'main' : {
      return baseUseStore(keyMain)
    }
    case 'devices' : {
      return baseUseStore(keyDevices)
    }
    default: {
      return baseUseStore(keyMain)
    }
  }
}
