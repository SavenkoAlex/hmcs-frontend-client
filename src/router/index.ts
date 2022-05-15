import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw
} from 'vue-router'

import {
  getNavigationItems
} from '@/api/router'
import { Vue } from 'vue-class-component'
import { Component } from 'vue'
/*
const home = {
  template: '<div>Log in</div>'
}
const about = {
  template: '<div>about</div>'
}
*/
const routes: RouteRecordRaw[] = []

getNavigationItems().then(response => {
  if (response === null) {
    return
  }
  const serverRoutes = response[0].menuItems.map(item => {
    return {
      path: item.path,
      name: item.label,
      component: require(`@/components/${item.label}`)
    }
  })

  routes.push(...serverRoutes)
})

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
