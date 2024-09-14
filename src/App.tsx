import {
  defineComponent,
  VNode
} from 'vue'

/** components */
import MainNavbar from '@/components/MainNavbar/MainNavbar'
import MainFooter from '@/components/MainFooter/MainFooter'

/** layouts */
import DefaultLayout from '@/layouts/default'

import { RouterView } from 'vue-router'

export default defineComponent({

  name: 'App',

  components: {
    DefaultLayout,
    MainNavbar,
    MainFooter
  },

  data () {
    return {
      janusHandler: null
    }
  },

  render(): VNode {
    return <DefaultLayout>
    {{
      header: () => <MainNavbar/>,
      default: () => <RouterView/>,
      footer: () => <MainFooter/>
    }}
    </DefaultLayout>
  }
})
