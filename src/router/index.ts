import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw
} from 'vue-router'

import StreamsList from '@/pages/StreamsList'
import Stream from '@/pages/Stream'
import User from '@/pages/Publisher/Publisher'
import Login from '@/pages/Login/Login'
import Register from '@/pages/Register/Register'

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
    name: 'login',
    path: '/login',
    component: Login
  },
  // register page
  {
    name: 'register',
    path: '/register',
    component: Register
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
