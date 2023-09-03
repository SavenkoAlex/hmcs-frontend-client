import {
  defineComponent,
  VNode
} from 'vue'

import MainNavbar from '@/components/MainNavbar/MainNavbar'
import DefaultLayout from '@/layouts/default'

export default defineComponent({

  name: 'App',

  components: {
    DefaultLayout,
    MainNavbar
  },

  render(): VNode {
    return <DefaultLayout>
    {{
      header: () => <MainNavbar/>
    }}
    </DefaultLayout>
  }
})
