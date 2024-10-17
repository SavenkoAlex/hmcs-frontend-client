import {
  NavigationGuardWithThis,
} from 'vue-router'

import { UserRole, User as UserData, Maybe } from '@/types/global'
import { userRoutes, BaseRoutes } from '@/router/types'
import { userData } from '@/types/store'
import { encryptStorage } from '@/services/secureStoorage'
/** all availabal roles  */
const userRoles: UserRole[] = [UserRole.USER, UserRole.ANONYMOUS, UserRole.WORKER]

/**
 * checks if user role contains associated routes
 */
export const userRoleAuth: NavigationGuardWithThis <unknown> = (to, from) => {

  if (!to) {
    return false
  }
  
  const user = encryptStorage.getItem(userData)

  if (!user) {
    return userRoutes[UserRole.ANONYMOUS].includes(to.name as BaseRoutes)
  }

  try {
    const parsed = JSON.parse(user)
    const role: Maybe<UserRole> = parsed.role
    if (!role || !userRoles.includes(role) ) {
      return false
    }

    const isRouteAvailable = userRoutes[role].includes(to.name as BaseRoutes) 
    return isRouteAvailable
  } catch (err) {
    return false
  }
}
