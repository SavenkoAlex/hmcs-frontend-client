import { UserMutationTypes } from '@/store/user/mutation-types'
import { UserState } from '@/types/store'
import { User } from '@/types/global'
import { Payload } from 'vuex'

export const mutations = {
  [UserMutationTypes.SET_USER]: (state: UserState, payload: string | null) => {
    state.userData = payload
  },

  [UserMutationTypes.SET_USER_PROPERTY]: <T extends keyof UserState> (state: UserState, payload: Pick <UserState, T>) => {
    for (const key in payload) {
      state[key] = payload[key]
    }
  }
}
