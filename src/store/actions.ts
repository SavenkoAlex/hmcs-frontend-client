import { ActionContext, Payload } from 'vuex'
import { State, store } from '@store/index'
import { MutationTypes } from '@store/mutation-types'
import loginApi from '@/api/login'

export const actions = {
  login: <T extends { email: string, password: string }> (context: ActionContext <typeof store, State>, payload: T) => {
    const { email, password } = payload
    
    loginApi.login(email, password).then(result => {
      context.commit(MutationTypes.SET_USER_DATA, { 
        type: MutationTypes.SET_USER_DATA,
        value: result
       })
    })

  }
}
