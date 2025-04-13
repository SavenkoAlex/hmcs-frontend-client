import { UserMutationTypes } from '@/store/user/mutation-types'
import { UserState } from '@/types/store'
import { User, UserAccount } from '@/types/global'

export const mutations = {
  [UserMutationTypes.SET_USER]: (state: UserState, payload: string | null) => {
    state.userData = payload
  },

  [UserMutationTypes.SET_USER_PROPERTY]: <T extends keyof UserState> (state: UserState, payload: Pick <UserState, T>) => {
    for (const key in payload) {
      state[key] = payload[key]
    }
  }, 

  [UserMutationTypes.SET_USER_AMOUNT]: (state: UserState, payload: UserAccount['amount']) => {
    state.amount = payload
  }
}
