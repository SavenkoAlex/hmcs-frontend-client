import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw
} from 'vue-router'

import Main from '@/components/Main.vue'
import Login from '@/components/Login.vue'

const routes: RouteRecordRaw[] = []

const serverRoutes = [
  {
    path: '/',
    component: Main
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

export default router
