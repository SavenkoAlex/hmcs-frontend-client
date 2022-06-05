import { ActionContext } from 'vuex'
import { State, store } from '@store/index'
import { MutationTypes } from '@store/mutation-types'
import { StoreMessageDefault } from '@store/mutations'

export const actions = {
  setDefaultStoreMessage: function (context: ActionContext <typeof store, State>, payload: StoreMessageDefault): void {
    context.commit(MutationTypes.SET_DEFAULT_STORE_MESSAGE, payload)
  }
}
