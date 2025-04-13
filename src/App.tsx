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
import { JanusPlugin, UserRole, chatKey, subscriberHandlerKey, publisherHandlerKey} from '@/types/global'
import { mapGetters, mapActions } from 'vuex'

/** store */
import { States } from '@/types/store'
import { useToast } from 'vue-toastification'

/** event bus */
import eventBus from '@/services/eventBus'

export default defineComponent({

  name: 'App',

  components: {
    DefaultLayout,
    MainNavbar,
    MainFooter
  },

  setup () {
    const chatHandler = ref <ChatHandler | null> (null)
    const subscriberHandler = ref <SubscriberStreamHandler | null> (null)
    const publisherHandler = ref <PublisherStreamHandler | null> (null)

    provide<typeof subscriberHandler> (subscriberHandlerKey, subscriberHandler)
    provide<typeof publisherHandler> (publisherHandlerKey, publisherHandler)
    provide<typeof chatHandler> (chatKey, chatHandler)

    const performanceObserver = ref <PerformanceObserver>()

    const toast = useToast()

    return {
      chatHandler,
      publisherHandler,
      subscriberHandler,
      toast,
      performanceObserver
    }
  },

  computed: {
    ...mapGetters(States.USER, [ 'userRole', 'isAuthentificated', 'userData']),
    ...mapGetters(States.APP, ['webrtcSessionId', 'chatSessionId', 'videoErrorState', 'performanceNavigationType']),

    roomNumber (): number | null {
      if (this.userRole === UserRole.WORKER) {
        return this.userData?.streamId || null
      }
      return null
    }
  },

  watch: {

    isAuthentificated: {
      handler: function (newValue = false, oldValue) {
        if (newValue === oldValue) {
          return
        }
        this.initHandlers()
      }
    },
  },
  
  methods: {
    ...mapActions(States.APP, [
      'setWebrtcSessionId', 
      'setChatSessionId', 
      'setPerformanceNavigationType',
      'setVideoErrorState',
      'setIsVideoHandlerAvailable',
      'setIsChatHandlerAvailable'
    ]),

    async initSubscriber () {
      /*
      const subHandler = await SubscriberStreamHandler.init(Janus, JanusPlugin.VITE_WEBRTC_PLUGIN)

      if (!subHandler) {
        this.toast.error(this.$t('services.webrtc.errors.webRTCIsNotAvailable'))
        return
      }
      this.subscriberHandler = subHandler
      */
     
      await this.addSubscriber()

      if (!this.isAuthentificated || !this.subscriberHandler) {
        return
      }

      ChatHandler.init(Janus, JanusPlugin.VITE_TEXT_PLUGIN).then(result => {
        if (result) {
          this.chatHandler = result
          this.setChatSessionId(result.handler.getId())
        }

      })
    },
    async initPublisher () {
      /*
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
      */

      await this.addPublisher()

      if (!this.publisherHandler) {
        return
      }

      ChatHandler.init(Janus, JanusPlugin.VITE_TEXT_PLUGIN).then(result => {
        if (result) {
          this.chatHandler = result
          this.setChatSessionId(result.handler.getId())
        }
      })
    },

    /** in case subscriber starts publishing */
    async addPublisher (to?: number): Promise <void> {
      console.log('adding a publisher...')
      const roomNumber = to || this.roomNumber
      if (!this.isAuthentificated || !this.userData || !Number.isFinite(roomNumber)) {
        return
      }

      if (this.publisherHandler) {
        await this.publisherHandler.destroySession()
      }

      const handler = await PublisherStreamHandler.init(Janus, JanusPlugin.VITE_WEBRTC_PLUGIN, {
        roomId: roomNumber as number,
        displayName: this.userData.username
      })

      if (!handler) {
        return
      }

      this.publisherHandler = handler
    },

    async addSubscriber (): Promise <void> {
      console.log('adding a subscriber...')
      if (this.subscriberHandler) {
        await this.subscriberHandler.destroySession()
      }

      const handler = await SubscriberStreamHandler.init(Janus, JanusPlugin.VITE_WEBRTC_PLUGIN)

      if (!handler) {
        return
      }

      this.subscriberHandler = handler
    },

    async initHandlers () {

      switch (this.userRole) {
        case UserRole.WORKER: {
          return this.initPublisher()
        }
        case UserRole.USER: {
          return this.initSubscriber()
        }

        default:
          return this.initSubscriber()
      }
    },

    setPerformanceTimingType (list: PerformanceObserverEntryList) {
      list.getEntries().forEach(item => {
        this.setPerformanceNavigationType((item as unknown as { type: NavigationTimingType })?.type  || null)
      })
    },

    destroySession (): Promise<[undefined | boolean, undefined | boolean, undefined | boolean]> {
      return Promise.all([
        this?.subscriberHandler?.destroySession(),
        this?.publisherHandler?.destroySession(),
        this?.chatHandler?.destroySession()
      ])
    },

    listen () {
      eventBus.on('destroy-session', this.destroySession) 
      eventBus.on('add-publisher', (value?: number) => this.addPublisher(value))
      eventBus.on('add-subscriber', this.addSubscriber)
    }
  },

  created () {
    this.performanceObserver = new PerformanceObserver(this.setPerformanceTimingType)
    this.performanceObserver.observe({ type: 'navigation', buffered: true });
  },

  mounted () {
    this.listen()
    setTimeout(() => {
      this.initHandlers()
    })
  },

  render(): VNode {
    return <DefaultLayout>
    {{
      header: () => <MainNavbar/>,
      default: () => <RouterView/>,
    }}
    </DefaultLayout>
  }
})
