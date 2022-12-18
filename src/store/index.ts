import { createStore, Store, useStore as baseUseStore, Module } from 'vuex'
import { InjectionKey } from 'vue'
import { actions as mainActions } from '@/store/main/actions'
import { getters as mainGetters } from '@/store/main/getters'
import { mutations as mainMutations } from '@/store/main/mutations'

export interface MainState {
  defaultStoreMessage: string
  userCredentials: tp.UserCredentials,
  user: tp.User
}

export interface DeviceState {
  defaultStoreMessage: string
}

export interface State {
  main: MainState
  device: DeviceState
}

const devices = {
  namespaced: true,
  state: {
    defaultStoreMessage: 'Hoi'
  }
}

const main: Module <MainState, State > = {
  namespaced: true,
  state: () => ({
    defaultStoreMessage: 'Hey',
    userCredentials: {
      email: null,
      password: null
    },
    user: {
      id: null,
      token: null
    }
  }),
  getters: mainGetters,
  mutations: mainMutations,
  actions: mainActions
}

export const keyMain: InjectionKey <Store <MainState>> = Symbol(tp.StoreKey.MAIN)
export const keyDevices: InjectionKey <Store <DeviceState>> = Symbol(tp.StoreKey.DEVICES)

export const store = createStore <State>({
  modules: {
    main,
    devices
  }
})

export function useStore (key?: tp.StoreKey): Store <typeof key extends 'main' ? MainState: DeviceState> {
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
