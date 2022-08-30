import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw
} from 'vue-router'

import Root from '@/components/Root.vue'
import Login from '@/components/Login.vue'

const routes: RouteRecordRaw[] = []

const serverRoutes = [
  {
    path: '/',
    component: Root,
    meta: {
      requiresAuth: true
    }
  }, {
    path: '/login',
    component: Login
  }
]

routes.push(...serverRoutes)

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
/*

router.beforeEach((to, _from) => {
  const at = document.cookie.split(';')
  console.log(at)
})
*/
export default router
