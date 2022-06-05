import { MutationTypes } from './mutation-types'
import { State } from './index'
import { Payload } from 'vuex'

export type StoreMessageDefault = Payload & {
  value: string
}

export type MenuItems = Payload & {
  value: {path: string, label: string}[]
}


export const mutations = {
  [MutationTypes.SET_DEFAULT_STORE_MESSAGE]: (state: State, payload: StoreMessageDefault): void => {
    state.main.defaultStoreMessage = payload.value
  },

  [MutationTypes.SET_MENU_ITEMS]: (state: State, payload: MenuItems): void => {
    state.main.menuItems = payload.value
  }
}
