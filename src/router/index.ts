import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const home = {
  template: '<div>home</div>'
}

const about = {
  template: '<div>about</div>'
}
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: about
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
