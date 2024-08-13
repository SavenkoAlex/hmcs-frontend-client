import { UserState, State } from '@/types/store'
import { Store, Module } from 'vuex'
import { InjectionKey } from 'vue'
import { actions } from '@/store/user/actions'
import { getters } from '@/store/user/getters'
import { mutations } from '@/store/user/mutations'
import { UserRole, Maybe } from '@/types/global'

export const user: Module <UserState, State> = {
  namespaced: true,
  state: {
    id: localStorage.getItem('id'),
    username: localStorage.getItem('username'),
    login: localStorage.getItem('login'),
    role: localStorage.getItem('role'),
    type: localStorage.getItem('type') as Maybe <UserRole>,
    amount: localStorage.getItem('amount') ? Number.parseInt(localStorage.getItem('amount') || '0', 10) : 0,
    accessToken: localStorage.getItem('accessToken'),
    streamId: localStorage.getItem('streamId') ? Number.parseInt(localStorage.getItem('streamId') || '0', 10) : null,
    isAuthentificated: Boolean(localStorage.getItem('isAuthentificated'))
  },
  actions,
  getters,
  mutations
}

export const userStateKey: InjectionKey <Store <UserState>> = Symbol()
