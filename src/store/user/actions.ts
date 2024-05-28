import { ActionContext } from 'vuex'
import { State, States, UserState } from '@/types/store'
import { UserMutationTypes } from '@/store/user/mutation-types'

type UserActionContext = ActionContext <UserState, State>

export const actions = {

  setUser: (context: UserActionContext, user: UserState) => {
    for (const [key, value] of Object.entries(user)) {
      localStorage.setItem(key, value)
    }

    context.commit( UserMutationTypes.SET_USER, user)
  },

  setUserProperty: <T extends keyof UserState> (context: UserActionContext, payload: Pick <UserState, T>) => {
    for (const [key, value] of Object.entries(payload)) {
      localStorage.setItem(key, value as string)
    }

    context.commit(UserMutationTypes.SET_USER_PROPERTY, payload)
  }
}
