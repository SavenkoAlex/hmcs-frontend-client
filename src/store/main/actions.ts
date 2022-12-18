import { ActionContext } from 'vuex'
import { State, MainState } from '@/store'
import { MutationTypes } from '@/store/main/mutation-types'
import loginApi from '@/api/login'

export const actions = {
  login: <T extends tp.UserCredentials> (context: ActionContext <MainState, State>, payload: T): void => {
    const { email, password } = payload

    if (!email || !password) {
      return
    }

    loginApi.login(email, password).then(result => {
      context.commit(MutationTypes.SET_USER_DATA, {
        type: MutationTypes.SET_USER_DATA,
        value: result
      })
    })
  }
}
