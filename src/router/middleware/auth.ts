import {
  NavigationGuardWithThis
} from 'vue-router'

import { isAuthentificated } from '@/helpers/helper'
import { storeUserKeyMap, UserRole } from '@/global/global'
import { RouteNames, UserRoutes } from '@/router/types'

const userRoutes: Record <UserRole & 'anonymous', RouteNames[]> = {
  [UserRole.USER]: ['user', 'stream', 'streams', 'root', 'auth', 'not-found'],
  [UserRole.WORKER]: ['user', 'live', 'root', 'auth', 'not-found'],
  anonymous: ['stream', 'streams', 'root', 'auth', 'not-found'] 
} as const

const userRoleAuth: NavigationGuardWithThis <unknown> = (to, from, next) => {
  if (!to) {
    return false
  }

}
