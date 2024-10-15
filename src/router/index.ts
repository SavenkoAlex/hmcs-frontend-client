import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw,
} from 'vue-router'

import StreamsList from '@/pages/Streams/StreamsList'
import Stream from '@/pages/Publisher/Stream'
import User from '@/pages/User/User'
import Login from '@/pages/Login/Login'
import NotFound from '@/pages/NotFound/NotFound'
import Subscriber from '@/pages/Subscriber/Subscriber'
import Registeration from '@/pages/Registration/Registeration'
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
    name: 'login',
    path: '/login',
    component: Login
  },

  {
    name: 'registration',
    path: '/registration',
    component: Registeration
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
