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

/** webrtc subscriber handler */
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'
/** webrtc publisher handler */
import { PublisherStreamHandler } from '@/services/webrtc/webrtcPublisher'

/** chat handler */
import { ChatHandler } from '@/services/webrtc/webrtcDataExchange'

import Janus, { JanusJS } from 'janus-gateway'

/** types */
import { JanusPlugin, UserRole } from '@/types/global'
import { mapGetters } from 'vuex'

/** store */
import { isAuthentificated, States } from '@/types/store'

export default defineComponent({

  name: 'App',

  components: {
    DefaultLayout,
    MainNavbar,
    MainFooter
  },

  setup () {
    const subscriberHandler = ref <SubscriberStreamHandler | null> (null)
    const publisherHandler = ref <PublisherStreamHandler | null> (null)
    const chatHandler = ref <ChatHandler | null> (null)

    provide<typeof subscriberHandler> ('subscriberHandler', subscriberHandler)
    provide<typeof publisherHandler> ('publisherHandler', publisherHandler)
    provide<typeof chatHandler> ('chatHandler', chatHandler)

    return {
      chatHandler,
      subscriberHandler,
      publisherHandler
    }
  },

  computed: {
    ...mapGetters(States.USER, [ 'userRole', 'isAuthentificated', 'userData'])
  },

  watch: {
    userRole: {
      handler: function(newValue = UserRole.ANONYMOUS, oldValue) {
        if (newValue === oldValue) {
          return
        }
        this.initHandlers()
      },
      immediate: true
    },

    isAuthentificated: {
      handler: function (newValue = false, oldValue) {
        if (newValue === oldValue) {
          return
        }
        this.initHandlers()
      },
      immediate: true
    }
  },
  
  methods: {

    initSubscriber () {
      SubscriberStreamHandler.init(Janus, JanusPlugin.VITE_WEBRTC_PLUGIN).then(result => {
        if (result) {
          this.subscriberHandler = result
        }
      })

      if (!this.isAuthentificated) {
        return
      }

      ChatHandler.init(Janus, JanusPlugin.VITE_TEXT_PLUGIN).then(result => {
        this.chatHandler = result
      })
    },

    initPublisher () {
      if (!this.isAuthentificated || !this.userData) {
        return
      }

      PublisherStreamHandler.init(Janus, JanusPlugin.VITE_WEBRTC_PLUGIN, {
        streamId: this.userData,
        displayName: this.userData
      })
    },

    initHandlers () {
      switch (this.userRole) {
        case UserRole.WORKER: {
          this.initPublisher()
          break
        }
        case UserRole.USER: {
          this.initSubscriber()
          break
        }

        default:
          this.initSubscriber()
      }
    }
  },

  mounted () {
    /*
    SubscriberStreamHandler.init(Janus, JanusPlugin.VITE_WEBRTC_PLUGIN).then(result => {
      if (result) {
        this.handler = result
      }
    })
      */
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
