import { ActionContext } from 'vuex'
import { 
  State, 
  UserState,
  userData,
  isAuthentificated,
  amount 
} from '@/types/store'
import { UserMutationTypes } from '@/store/user/mutation-types'
import { User, UserAccount} from '@/types/global'
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
          encryptStorage.setItem(isAuthentificated, `${value}`)
          break
        case 'userData':
          encryptStorage.setItem(userData, value)
          break
        default:
          return
      }
    }

    context.commit(UserMutationTypes.SET_USER_PROPERTY, payload)
  },

  setAmount: <T extends UserAccount['amount']> (context: UserActionContext, payload: T) => {
    try {
      encryptStorage.setItem(amount, payload.toString())
      context.commit(UserMutationTypes.SET_USER_AMOUNT, payload)
    } catch (err) {
      console.error('!!! ERROR SETTING AMOUNT', err)
    }
  }
}
