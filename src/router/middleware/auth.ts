import {
  NavigationGuardWithThis,
  useRouter
} from 'vue-router'

import { isAuthentificated } from '@/helpers/helper'
import { storeUserKeyMap, UserRole } from '@/types/global'
import { userRoutes, BaseRoutes } from '@/router/types'
import User from '@/pages/User/User'

/** all availabal roles  */
const userRoles: UserRole[] = [UserRole.USER, UserRole.ANONYMOUS, UserRole.WORKER]

/**
 * checks if user role contains associated routes
 */
export const userRoleAuth: NavigationGuardWithThis <unknown> = (to, from) => {
  if (!to) {
    return false
  }
  
  const role: UserRole = (localStorage.getItem('type') || UserRole.ANONYMOUS) as UserRole
  
  if (!role || !userRoles.includes(role) ) {
    return false
  }
  const isRouteAvailable = userRoutes[role].includes(to.name as BaseRoutes) 
  
  return isRouteAvailable
  /*
  return {
    path: isRouteAvailable ? to.path : from.path,
    query: isRouteAvailable ? to.query : from.query,
    hash: isRouteAvailable ? to.hash : from.hash
  }
    */
}
