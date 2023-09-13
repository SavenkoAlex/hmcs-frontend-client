import {
  defineComponent,
  VNode
} from 'vue'

import MainNavbar from '@/components/MainNavbar/MainNavbar'
import DefaultLayout from '@/layouts/default'
import { RouterView } from 'vue-router'

export default defineComponent({

  name: 'App',

  components: {
    DefaultLayout,
    MainNavbar
  },

  created () {
    localStorage.setItem('isAuthenticated', 'false')
  },

  render(): VNode {
    return <DefaultLayout>
    {{
      header: () => <MainNavbar/>,
      default: () => <RouterView/>
    }}
    </DefaultLayout>
  }
})
