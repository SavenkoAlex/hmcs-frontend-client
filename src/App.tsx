import {
  defineComponent,
  VNode,
  ref,
  provide,
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

import Janus from 'janus-gateway'

/** types */
import { JanusPlugin, UserRole, supKey, pubKey, chatKey } from '@/types/global'
import { mapGetters, mapActions } from 'vuex'

/** store */
import { States } from '@/types/store'
import { useToast } from 'vue-toastification'

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
    
    provide<typeof subscriberHandler> (supKey, subscriberHandler)
    provide<typeof publisherHandler> (pubKey, publisherHandler)
    provide<typeof chatHandler> (chatKey, chatHandler)

    const performanceObserver = ref <PerformanceObserver>()

    const toast = useToast()

    return {
      chatHandler,
      subscriberHandler,
      publisherHandler,
      toast,
      performanceObserver
    }
  },

  computed: {
    ...mapGetters(States.USER, [ 'userRole', 'isAuthentificated', 'userData']),
    ...mapGetters(States.APP, ['webrtcSessionId', 'chatSessionId'])
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
    ...mapActions(States.APP, ['setWebrtcSessionId', 'setChatSessionId', 'setPerformanceNavigationType']),

    initSubscriber () {
      SubscriberStreamHandler.init(Janus, JanusPlugin.VITE_WEBRTC_PLUGIN).then(result => {
        if (result) {
          this.subscriberHandler = result
          this.setWebrtcSessionId(result.handler.getId())
        } else {
          this.toast.error(this.$t('services.webrtc.errors.webRTCIsNotAvailable'))
        }
      })

      if (!this.isAuthentificated) {
        return
      }

      ChatHandler.init(Janus, JanusPlugin.VITE_TEXT_PLUGIN).then(result => {
        if (result) {
          this.chatHandler = result
          this.setChatSessionId(result.handler.getId())
        }
      })
    },

    initPublisher () {
      if (!this.isAuthentificated || !this.userData) {
        return
      }

      PublisherStreamHandler.init(Janus, JanusPlugin.VITE_WEBRTC_PLUGIN, {
        roomId: this.userData.streamId,
        displayName: this.userData.username
      }).then(result => {
        this.publisherHandler = result
        this.setWebrtcSessionId(result?.handler.getId())
      })

      ChatHandler.init(Janus, JanusPlugin.VITE_TEXT_PLUGIN).then(result => {
        if (result) {
          this.chatHandler = result
          this.setChatSessionId(result.handler.getId())
        }
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
    },

    setPerformanceTimingType (list: PerformanceObserverEntryList) {
      list.getEntries().forEach(item => {
        this.setPerformanceNavigationType((item as unknown as { type: NavigationTimingType })?.type  || null)
      })
    }
  },

  mounted () {
    this.performanceObserver = new PerformanceObserver(this.setPerformanceTimingType)
    this.performanceObserver.observe({ type: 'navigation', buffered: true });
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
