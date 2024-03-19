import { UserState } from '@/global/store'
import { User } from '@/global/global'

export const getters = {
  
  /**
   * Get user from state
   * @param {UserState} state - user state
   * @param {keyof User} [field] - optional field name
   * @returns {User[T] | User} - user field value or whole user object
   */
  getUser: function <T extends keyof User >(state: UserState, field?: T): User[T] | User {
    // if field is specified, return it's value from state
    if (field) {
      return state[field]
    }

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
  }
}
