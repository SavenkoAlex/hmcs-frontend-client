import { MutationTypes } from './mutation-types'
import { ModuleState, State } from './index'
import { Payload } from 'vuex'

export const mutations = {

  [MutationTypes.SET_USER_DATA]: (state: ModuleState <'main'>, payload: Payload & {
    value: {
      readonly id: string,
      readonly token: string
    }
  }) => {
    state.user = payload.value
  }
}
