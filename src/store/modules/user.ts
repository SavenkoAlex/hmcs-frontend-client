import { UserState, State } from '@/types/store'
import { Store, Module } from 'vuex'
import { InjectionKey } from 'vue'
import { actions } from '@/store/user/actions'
import { getters } from '@/store/user/getters'
import { mutations } from '@/store/user/mutations'

export const user: Module<UserState, State> = {
  namespaced: true,
  state: {
    id: null,
    username: null,
    login: null,
    role: null,
    type: null,
    amount: 0,
    accessToken: null,
    streamId: null
  },
  actions,
  getters,
  mutations
}

export const userStateKey: InjectionKey <Store <UserState>> = Symbol()
