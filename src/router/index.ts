import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw
} from 'vue-router'

import {
  getNavigationItems
} from '@/api/router'

const routes: RouteRecordRaw[] = []

getNavigationItems().then(response => {
  /*
  if (response === null) {
    return
  }
  const serverRoutes = response[0].menuItems.map(item => {
    return {
      path: item.path,
      name: item.label,
      component: require(`@/components/${item.label[0].toUpperCase() + item.label.slice(1, item.label.length)}.vue`)
    }
  })

  routes.push(...serverRoutes)
  */
})

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
