import { MutationTypes } from '@/store/main/mutation-types'
import { MainState } from '@/store'
import { Payload } from 'vuex'

export const mutations = {

  [MutationTypes.SET_USER_DATA]: (state: MainState, payload: Payload & {
    value: {
      readonly id: string,
      readonly token: string
    }
  }) => {
    state.user = payload.value
  }
}
