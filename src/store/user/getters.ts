import { UserState } from '@/types/store'
import { User, UserRole, Maybe } from '@/types/global'

export const getters = {
  
  /**
   * Get user from state
   * @param {UserState} state - user state
   * @param {keyof User} [field] - optional field name
   * @returns {User[T] | User} - user field value or whole user object
   */
  getUserData: function <T extends keyof User >(state: UserState): Omit <User, 'avatar'> | null {
    const userData = state.userData

    if (!userData) {
      return null
    }

    const parsed: User = JSON.parse(userData)
    return parsed || null
  },

  userRole: function (state: UserState): UserRole {
    const userData = state.userData
    if (!userData) {
      return UserRole.ANONYMOUS
    }
    const parsed: User = JSON.parse(userData)
    const role = parsed?.type || UserRole.ANONYMOUS
    return role as UserRole
  },

  isAuthentificated: function (state: UserState): boolean {
    return !!state.isAuthentificated
  },

  userId: function (state: UserState): string | null {
    const userData = state.userData
    if (!userData) {
      return UserRole.ANONYMOUS
    }
    const parsed: User = JSON.parse(userData)
    const id = parsed?.id || null
    return id
  },

  userData: function (state: UserState): Omit<User, 'avatar'> | null {
    const userData = state.userData
    if (!userData) {
      return null
    }

    return JSON.parse(userData) || null
  }
}
