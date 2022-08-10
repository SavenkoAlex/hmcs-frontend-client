import { MutationTypes } from './mutation-types'
import { ModuleState } from './index'
import { Payload } from 'vuex'

export type StoreMessageDefault = Payload & {
  value: string
}

export type MenuItems = Payload & {
  value: {path: string, label: string}[]
}

export const mutations = {
  [MutationTypes.SET_DEFAULT_STORE_MESSAGE]: (state: ModuleState <'main'>, payload: StoreMessageDefault): void => {
    state.defaultStoreMessage = payload.value
  },

  [MutationTypes.SET_MENU_ITEMS]: (state: ModuleState <'main'>, payload: MenuItems): void => {
    state.menuItems = payload.value
  }
}
