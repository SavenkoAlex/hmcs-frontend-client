import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw
} from 'vue-router'

import Home from '@/pages/home.vue'
import Login from '@/pages/login.vue'
import FileUpload from '@/pages/fileUpload.vue'

const routes: RouteRecordRaw[] = []

const serverRoutes = [
  {
    path: '/',
    component: Home
  }, {
    path: '/login',
    component: Login
  }, {
    path: '/upload',
    component: FileUpload
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
