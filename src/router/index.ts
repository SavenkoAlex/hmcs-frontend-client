import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw
} from 'vue-router'

import StreamsList from '@/pages/StreamsList'
import Stream from '@/pages/Stream'
import User from '@/pages/User/User'
import Auth from '@/pages/Auth/Auth'
import NotFound from '@/pages/NotFound/NotFound'

const routes: RouteRecordRaw[] = []

const serverRoutes = [
  {
    // all streams list
    name: 'streams',
    path: '/streams',
    component: StreamsList
  }, 
  {
    // dedicated stream
    name: 'live',
    path: '/live/:id',
    component: Stream
  },
  {
    // user profile
    name: 'user',
    path: '/user',
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

router.beforeEach((_to, _from) => {
  
})
/*

router.beforeEach((to, _from) => {
  const at = document.cookie.split(';')
  console.log(at)
})
*/
export default router
