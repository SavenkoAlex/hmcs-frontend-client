import { ActionContext } from 'vuex'
import { State, store } from '.'
import { MutationTypes } from './mutation-types'
import { StoreMessageDefault } from './mutations'

export const actions = {
  setDefaultStoreMessage: function (context: ActionContext <typeof store, State>, payload: StoreMessageDefault): void {
    context.commit(MutationTypes.SET_DEFAULT_STORE_MESSAGE, payload)
  }
}
