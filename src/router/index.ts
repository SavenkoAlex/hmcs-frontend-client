import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw,
  RouteLocationNormalized,
  NavigationGuardNext
} from 'vue-router'

import StreamsList from '@/pages/Streams/StreamsList'
import Stream from '@/pages/Publisher/Stream'
import User from '@/pages/User/User'
import Auth from '@/pages/Auth/Auth'
import NotFound from '@/pages/NotFound/NotFound'
import Subscriber from '@/pages/Subscriber/Subscriber'
import  { userRoleAuth } from '@/router/middleware/auth'

const routes: RouteRecordRaw[] = []

const serverRoutes = [
  {
    // root
    name: 'root',
    path: '/',
    redirect: 'streams'
  },
  {
    // all streams list
    name: 'streams',
    path: '/streams',
    component: StreamsList,
  }, 
  /** publisher stream */
  {
    name: 'stream',
    path: '/stream',
    beforeEnter: [userRoleAuth],
    component: Stream
  },
  {
    // dedicated stream on client side
    name: 'publisher',
    path: '/publisher/:id',
    beforeEnter: [userRoleAuth],
    component: Subscriber
  },
  {
    // user profile
    name: 'user',
    path: '/user',
    beforeEnter: [userRoleAuth],
    component: User
  },
  {
    // LoginPage
    name: 'auth',
    path: '/auth',
    component: Auth
  },
  {
    // not found
    name: 'not-found',
    path: '/:pathMatch(.*)*',
    component: NotFound
  }
]

routes.push(...serverRoutes)

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
