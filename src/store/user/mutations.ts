import { UserMutationTypes } from '@/store/user/mutation-types'
import { UserState } from '@/global/store'
import { User } from '@/global/global'
import { Payload } from 'vuex'

export const mutations = {
  [UserMutationTypes.SET_USER]: (state: UserState, payload: Payload & User) => {
    state.id = payload.id
    state.login = payload.login
    state.username = payload.username
    state.role = payload.role
    state.type = payload.type
  },

  [UserMutationTypes.SET_USER_PROPERTY]: <T extends keyof UserState> (state: UserState, payload: Pick <UserState, T>) => {
    for (const key in payload) {
      state[key] = payload[key]
    }
  }
}
