import { UserState } from '@/types/store'
import { User, UserRole, Maybe } from '@/types/global'

export const getters = {
  
  userRole: function (state: UserState): UserRole {
    const userData = state.userData

    if (!userData) {
      return UserRole.ANONYMOUS
    }
    try {
      const parsed: User = JSON.parse(userData)
      const role = parsed?.role || UserRole.ANONYMOUS
      return role as UserRole
    } catch (err) {
      console.error(err)
      return UserRole.ANONYMOUS
    }
  },

  isAuthentificated: function (state: UserState): boolean {
    return !!state.isAuthentificated
  },

  userId: function (state: UserState): string | null {
    const userData = state.userData
    if (!userData) {
      return null
    }

    try {
      const parsed: User = JSON.parse(userData)
      const id = parsed?.id || null
      return id
    } catch (err) {
      console.error(err)
      return null
    }
  },

  userData: function (state: UserState): Omit<User, 'avatar'> | null {
    const userData = state.userData
    if (!userData) {
      return null
    }
    try {
      const parsed = JSON.parse(userData)
      return parsed || null
    } catch (err) {
      console.error(err)
      return null
    }
  }
}
