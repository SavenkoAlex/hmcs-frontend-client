import clickOutside from '../directives/click-ouside'
import vue from 'vue'
/**
 * You can register global directives here and use them as a plugin in your main Vue instance
 */

const GlobalDirectives = {
  install (Vue: vue.App): void {
    Vue.directive('click-outside', clickOutside)
  }
}

export default GlobalDirectives
