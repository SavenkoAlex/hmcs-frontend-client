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

    'subscriberHandler.handlerInstance': {
      handler: function (newValue) {

        if (newValue?.id) {
          this.listenToSubscriber()
        }
      },

      immediate: true
    },

    'publisherHandler.handlerInstance': {
      handler: function (newValue) {

        if (newValue?.id) {
          this.listenToPublisher()
        }
      },

      immediate: true
    }
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
      await this.addSubscriber()

      if (!this.isAuthentificated || !this.subscriberHandler) {
        return
      }

      await this.addChatHandler()
    },

    async initPublisher () {

      await this.addPublisher()

      if (!this.publisherHandler) {
        return
      }

      await this.addSubscriber()

      if (!this.subscriberHandler) {
        return
      }

      await this.addChatHandler()
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

      const handler = PublisherStreamHandler.init(Janus, JanusPlugin.VITE_WEBRTC_PLUGIN, {
        roomId: roomNumber as number,
        displayName: this.userData.username
      })

      await handler?.handle()

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

      const handler = SubscriberStreamHandler.init(Janus, JanusPlugin.VITE_WEBRTC_PLUGIN)

      if (!handler) {
        return
      }

      this.subscriberHandler = handler
      this.subscriberHandler.handle()
    },

    async addChatHandler () {
      console.log('adding a chathandler...')
      //TODO: destroy session

      const handler = ChatHandler.init(Janus, JanusPlugin.VITE_TEXT_PLUGIN)
      if (!handler) {
        return
      }
      this.chatHandler = handler
      this.chatHandler?.handle()
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

    destroySession (): Promise<[boolean | undefined,  boolean | undefined, boolean | undefined]> {
      return Promise.all([
        this.subscriberHandler?.destroySession(),
        this.publisherHandler?.destroySession(),
        this.chatHandler?.destroySession()
      ])
    },

    listenToSubscriber () {
      this.subscriberHandler?.emitter.on('destroy-session', this.destroySession) 
      this.subscriberHandler?.emitter.on('add-publisher', (value?: number) => this.addPublisher(value))
    },

    listenToPublisher () {
      this.publisherHandler?.emitter.on('destroy-session', this.destroySession) 
      this.publisherHandler?.emitter.on('add-subscriber', this.addSubscriber)
    }
  },

  created () {
    this.performanceObserver = new PerformanceObserver(this.setPerformanceTimingType)
    this.performanceObserver.observe({ type: 'navigation', buffered: true });
  },

  mounted () {
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
