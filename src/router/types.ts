export type RouteNames = 'streams' |
 'live' |
 'user' | 
 'auth' | 
 'not-found' |
 'stream' |
 'root'

/** base share resources */
export type BaseRoutes = 'root' | 'auth' | 'not-found'
/** authorized subscriber resources */
export type UserRoutes = BaseRoutes & 'user' | 'stream' | 'streams'
/** allowed free subscriber resources */
export type AnonymousRoutes = BaseRoutes & 'stream' | 'streams'
/** worker (publisher) resources */
export type WorkerRoutes = BaseRoutes & 'user' | 'live'


