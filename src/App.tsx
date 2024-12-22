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
import { JanusPlugin, UserRole, supKey, pubKey, chatKey, videoHandlerKey,VideoErrorState, VideoHandler } from '@/types/global'
import { webRTCEventJanusMap, AttachEvent, VideoRoomPluginError, CommonVideoPluginError } from '@/types/janus'
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
    const videoHandler = ref <SubscriberStreamHandler | PublisherStreamHandler | null> (null)

    provide<typeof videoHandler> (videoHandlerKey, videoHandler)
    provide<typeof chatHandler> (chatKey, chatHandler)

    const performanceObserver = ref <PerformanceObserver>()

    const toast = useToast()

    return {
      chatHandler,
      videoHandler,
      toast,
      performanceObserver
    }
  },

  computed: {
    ...mapGetters(States.USER, [ 'userRole', 'isAuthentificated', 'userData']),
    ...mapGetters(States.APP, ['webrtcSessionId', 'chatSessionId', 'videoErrorState']),

    roomNumber (): number | null {
      if (this.userRole === UserRole.WORKER) {
        return this.userData?.streamId || null
      }

      return this.$route.params.id ? Number(this.$route.params.id) : null
    }
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
    },

    videoErrorState (newValue) {
      if (!newValue) {
        return
      }
      
      if (newValue.state === VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_NOT_IN_A_ROOM ||
        newValue.state === CommonVideoPluginError.SERVER_DOWN ||
        newValue.state === VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN
      ) {
        this.initHandlers()
      }
    },

    chatHandler (newValue) {
      this.setIsChatHandlerAvailable(!!newValue)
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

    initSubscriber () {
      SubscriberStreamHandler.init(Janus, JanusPlugin.VITE_WEBRTC_PLUGIN).then(result => {
        if (result) {
          this.videoHandler = result
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
        this.videoHandler = result
        this.setWebrtcSessionId(result?.handler.getId())
      })

      ChatHandler.init(Janus, JanusPlugin.VITE_TEXT_PLUGIN).then(result => {
        if (result) {
          this.chatHandler = result
          this.setChatSessionId(result.handler.getId())
        }
      })
    },

    async initHandlers () {
      if (this.videoHandler) {
        await this.videoHandler.leave()
      }

      if (this.chatHandler && this.roomNumber) {
        if (this.userRole === UserRole.WORKER) {
          await this.chatHandler.destroyChat(this.roomNumber)
        } else {
          await this.chatHandler.leave(this.roomNumber)
        }
      }

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
    },

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
    }}
    </DefaultLayout>
  }
})
