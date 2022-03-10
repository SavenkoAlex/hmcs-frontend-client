import { MutationTypes } from './mutation-types'
import { State } from './index'
import { Payload } from 'vuex'

export type StoreMessageDefault = Payload & {
  value: string
}

export const i = 2
export const mutations = {
  [MutationTypes.SET_DEFAULT_STORE_MESSAGE]: (state: State, payload: StoreMessageDefault): void => {
    state.defaultStoreMessage = payload.value
  }
}
