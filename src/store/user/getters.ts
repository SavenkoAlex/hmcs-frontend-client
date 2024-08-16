import { UserState } from '@/types/store'
import { User, UserRole, Maybe } from '@/types/global'

export const getters = {
  
  /**
   * Get user from state
   * @param {UserState} state - user state
   * @param {keyof User} [field] - optional field name
   * @returns {User[T] | User} - user field value or whole user object
   */
  getUser: function <T extends keyof User >(state: UserState): Omit <User, 'avatar'> {

    // id 
    const id = state.id
    // login
    const login = state.login
    // username 
    const username = state.username
    // user role like 'worker' or 'user'
    const type = state.type
    // ???
    const role = state.role
    // stream id only usable for worker role
    const streamId = state.streamId

    return {
      id, 
      login,
      username,
      type,
      role,
      streamId
    }
  },

  userRole: function (state: UserState): UserRole {
    const role = state.type || UserRole.ANONYMOUS
    return role as UserRole
  },

  isAuthentificated: function (state: UserState): boolean {
    return !!state.isAuthentificated
  },

  userId: function (state: UserState): string | null {
    const id = state.id || null
    return id
  }
}
