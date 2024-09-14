import {
  defineComponent,
  VNode,
  ref,
  provide,
  Ref
} from 'vue'

/** components */
import MainNavbar from '@/components/MainNavbar/MainNavbar'
import MainFooter from '@/components/MainFooter/MainFooter'

/** layouts */
import DefaultLayout from '@/layouts/default'

/** router */
import { RouterView } from 'vue-router'

/** webrtcHandler */
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'
import Janus, { JanusJS } from 'janus-gateway'

/** types */
import { JanusPlugin } from '@/types/global'

export default defineComponent({

  name: 'App',

  components: {
    DefaultLayout,
    MainNavbar,
    MainFooter
  },

  setup () {
    const handler = ref <SubscriberStreamHandler | null> (null)
    provide<typeof handler> ('handler', handler)

    return {
      handler
    }
  },

  mounted () {
    SubscriberStreamHandler.init(Janus, JanusPlugin.VITE_WEBRTC_PLUGIN).then(result => {
      if (result) {
        this.handler = result
      }
    })
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
