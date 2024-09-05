
import { UserRole } from '@/types/global'

/** base common resources */
export type BaseRoutes = 'root' | 'auth' | 'not-found'
/** authorized subscriber resources */
export type UserRoutes = BaseRoutes | 'user' | 'publisher' | 'streams'
/** allowed free subscriber resources */
export type AnonymousRoutes = BaseRoutes | 'publisher' | 'streams'
/** worker (publisher) resources */
export type WorkerRoutes = BaseRoutes | 'user' | 'stream'

export type AppRoutes = {
  [UserRole.USER]: BaseRoutes[] | UserRoutes[]
  [UserRole.ANONYMOUS]: BaseRoutes[] | AnonymousRoutes[],
  [UserRole.WORKER]: BaseRoutes[] | WorkerRoutes[]
}

/** routes per user role */
export const userRoutes: AppRoutes = {
  [UserRole.USER]: ['auth', 'not-found', 'root', 'publisher', 'streams', 'user'],
  [UserRole.WORKER]: ['auth', 'not-found', 'root', 'stream', 'user'],
  [UserRole.ANONYMOUS]: ['auth', 'not-found', 'root', 'streams', 'publisher']
}

export type UserLinks = {
  [UserRole.USER]: Exclude<UserRoutes, 'publisher' | BaseRoutes>[]
  [UserRole.ANONYMOUS]: Exclude <AnonymousRoutes, 'publicher' | 'root' | 'not-found'>[]
  [UserRole.WORKER]: Exclude <WorkerRoutes, BaseRoutes>[]
}

/** user links displayed in the navigation  */
export const userLinks: UserLinks = {
  [UserRole.USER]: ['streams', 'user'],
  [UserRole.ANONYMOUS]: ['auth', 'streams'],
  [UserRole.WORKER]: ['stream', 'user']
}
