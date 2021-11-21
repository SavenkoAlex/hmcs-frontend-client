
import globalComponents from './globalComponents'
import globalDirectives from './globalDirectives'

import vue from 'vue'
const Argon: {
  install: (Vue: vue.App) => void
} = {
  install (Vue) {
    Vue.use(globalComponents)
    Vue.use(globalDirectives)
  }
}

export default Argon
