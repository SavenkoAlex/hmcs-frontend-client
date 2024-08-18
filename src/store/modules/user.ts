import { UserState, State } from '@/types/store'
import { Store, Module } from 'vuex'
import { InjectionKey, inject } from 'vue'
import { actions } from '@/store/user/actions'
import { getters } from '@/store/user/getters'
import { mutations } from '@/store/user/mutations'
import { encryptStorage } from '@/services/secureStoorage'
import {
  isAuthentificated,
  amount,
  userData,
} from '@/types/store'

export const user: Module <UserState, State> = {
  namespaced: true,
  state: {
    amount: <number> encryptStorage.getItem(amount) || 0,
    accessToken: localStorage.getItem('accessToken'),
    isAuthentificated: <boolean> encryptStorage.getItem(isAuthentificated),
    userData: <string> encryptStorage.getItem(userData)
  },
  actions,
  getters,
  mutations
}

export const userStateKey: InjectionKey <Store <UserState>> = Symbol()
