import { UserState } from '@/global/store'
import { User, UserRole } from '@/global/global'

export const getters = {
  
  /**
   * Get user from state
   * @param {UserState} state - user state
   * @param {keyof User} [field] - optional field name
   * @returns {User[T] | User} - user field value or whole user object
   */
  getUser: function <T extends keyof User >(state: UserState, field?: T, payload?: T): User[T] | User {

    // return whole user object
    return {
      // id property
      id: state.id,
      // login property
      login: state.login,
      // username property
      username: state.username,
      // type property
      type: state.type,
      // role property
      role: state.role
    }
  },

  userType: function (state: UserState) {
    return state.type || UserRole.ANONYMOUS
  },

  isAuthetificated: function (state: UserState) {
    return state.id && state.role && state.username && state.login
  }
}
