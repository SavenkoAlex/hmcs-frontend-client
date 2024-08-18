import { ActionContext } from 'vuex'
import { 
  State, 
  UserState,
  userData,
  isAuthentificated,
  amount 
} from '@/types/store'
import { UserMutationTypes } from '@/store/user/mutation-types'
import { User } from '@/types/global'
import { encryptStorage } from '@/services/secureStoorage'

type UserActionContext = ActionContext <UserState, State>

export const actions = {

  setUser: async (context: UserActionContext, user: Omit <User, 'avatar'>) => {
    const stringified = JSON.stringify(user)
    encryptStorage.setItem(userData, stringified)
    context.commit( UserMutationTypes.SET_USER, stringified)
  },

  setUserProperty: <T extends keyof UserState> (context: UserActionContext, payload: Pick <UserState, T>) => {
    for (const [key, value] of Object.entries(payload)) {

      switch (key) {
        case 'isAuthentificated': 
          encryptStorage.setItem(isAuthentificated, value)
          break
        case 'userData':
          encryptStorage.setItem(userData, value)
          break
        case 'amount':
          encryptStorage.setItem(amount, value)
          break
        default:
          return
      }
    }

    context.commit(UserMutationTypes.SET_USER_PROPERTY, payload)
  }
}
