import {
  NavigationGuardWithThis,
  useRouter
} from 'vue-router'

import { isAuthentificated } from '@/helpers/helper'
import { storeUserKeyMap, UserRole } from '@/types/global'
import { userRoutes, BaseRoutes } from '@/router/types'

/** all availabal roles  */
const userRoles: UserRole[] = [UserRole.USER, UserRole.ANONYMOUS, UserRole.WORKER]

/**
 * checks if user role contains associated routes
 */
export const userRoleAuth: NavigationGuardWithThis <unknown> = (to, _from, _next) => {
  if (!to) {
    return false
  }
  const role: UserRole | null = localStorage.getItem('role') as UserRole
  if (!role || !userRoles.includes(role) ) {
    return false
  }
  return userRoutes[role].includes(to.path as BaseRoutes) 
}
