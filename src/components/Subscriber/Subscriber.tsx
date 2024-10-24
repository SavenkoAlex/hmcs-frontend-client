import {
  defineComponent,
  ref,
  TransitionGroup,
  Transition,
  VNode,
  inject,
  useTemplateRef
} from 'vue'

/** store */
import { mapGetters } from 'vuex'

import Janus from 'janus-gateway'
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'
import { ChatHandler } from '@/services/webrtc/webrtcDataExchange'

/** style */
import '@/components/Subscriber/Subscriber.scss'

/** components */
import Chat from '@/components/Chat/Chat'
import BaseVideo from '@/components/Video/Video'
import StateBar from '@/components/StateBar/StateBar'
import ImageMask from '@/components/general/ImageMask/ImageMask'

/** api */
import userApi from '@/api/user'

/** types */
import { Data } from '@/components/Subscriber/types'
import { StreamRole, supKey, chatKey } from '@/types/global'
import { webRTCEventJanusMap, AttachEvent, VIDEO_ROOM_PLUGIN_EVENT } from '@/types/janus'

/** layouts */
import RoomLayout from '@/layouts/Room/Room'

/**images */
import bg from '@/assets/images/taro-bg.jpg'

/** notifier */
import { useToast } from 'vue-toastification'

export default defineComponent({

  name: 'Subscriber',

  components: {
    Chat,
    BaseVideo,
    StateBar,
    RoomLayout,
    ImageMask
  },

  computed: {
    ...mapGetters('user', ['userData']),

    publisherId () {
      const publisherId: string | undefined = Array.isArray(this.$route.params?.id) 
        ? this.$route.params.id[0]
        : this.$route.params.id as string

      if (!publisherId) {
        return null
      }

      return publisherId
    },
  },

  watch: {
    subscriberHandler: {
      handler (newValue) {
        if (!newValue) {
          return
        }
        this.addListeners()
      },
      immediate: true
    }
  },

  setup () {

    const remoteStream = ref <MediaStream> ()
    const remoteVideoNode = useTemplateRef <HTMLMediaElement> ('video')
    const constraints = {
      audio: false,
      video: true
    }
    const subscriberName = ref <string>('sasha the programmer')
    const mountPoint = ref <number> ()
    const subscriberHandler = inject <SubscriberStreamHandler | null> (supKey, null)
    const chatPluginHandler = inject <ChatHandler | null> (chatKey, null)
    const videoTrack = ref <MediaStreamTrack | null>()
    const audioTrack = ref <MediaStreamTrack | null> ()
    const toast = useToast()
    const isJoined = ref <boolean> (false)

    return {
      remoteStream,
      remoteVideoNode,
      constraints,
      chatPluginHandler,
      videoTrack,
      audioTrack,
      mountPoint,
      subscriberName,
      subscriberHandler,
      toast,
      isJoined
    }
  },

  data (): Data {
    return {
      publisher: null,
      publisherAccount: null,
      isPublisherAvailable: false
    }
  },

  methods: {
    /** get data according to publisher */
    async getUserData () {
      if (!this.publisherId) {
        return null
      }
      const user = await userApi.getUser(this.publisherId)
      return user || null
    },

    onremotetrack (descripption: {on: boolean, track: MediaStreamTrack}) {
      const { track } = descripption
      this.remoteStream = new MediaStream([track])
      if (this.remoteStream && this.remoteVideoNode) {
        Janus.attachMediaStream(this.remoteVideoNode, this.remoteStream)
        this.isJoined = true
        return
      }
    },

    onClosed () {
      this.isJoined = false
    },

    collapseVideo (event: Event) {
      const video = event.target as HTMLVideoElement
      video.play()
    },

    onError (error: Error) {
      console.error(error)
      this.toast(this.$t('services.webrtc.errors.canNotConnectStream'))
      this.isJoined = false
    },

    onJoined () {
      this.isJoined = true
    },

    addListeners () {
      
      this.subscriberHandler?.emitter.on(
        webRTCEventJanusMap[AttachEvent.ONREMOTETRACK], data => this.onremotetrack(data)
      )
      
      this.subscriberHandler?.emitter.on(
        webRTCEventJanusMap[AttachEvent.ERROR], error => this.onError(error)
      )

      this.subscriberHandler?.emitter.on(
        VIDEO_ROOM_PLUGIN_EVENT.SUB_JOINED, () => {

        }
      )
    }
  },

  async mounted () {

    if (!this.publisherId) {
      return
    }

    this.publisher = await this.getUserData()

    if (!this.publisher) {
      return
    }

    if (this.publisher.streamId) {
      this.mountPoint = this.publisher.streamId
    }

    if (!this.mountPoint) {
      return
    }

    if (!this.subscriberHandler) {
      return
    }

    if (!this.publisherId || !this.publisher.streamId) {
      return
    }

    this.subscriberHandler.join(this.publisherId, this.publisher.streamId)
  },

  unmounted () {
    this.subscriberHandler?.handler.detach()
    this.chatPluginHandler?.handler.detach()
  },

  render (): VNode {
    return <RoomLayout>
      {{
        media: () => <div class="subscriber__publisher-media">
          { this.remoteStream 
            
            ? <TransitionGroup>
              <BaseVideo
                srcObject={this.remoteStream}
                autoplay
                playsinline
                ref={'video'}
              />
              </TransitionGroup>
            : <Transition name='offline'>
                <div class={'subscriber__publisher-avatar'}>
                  <ImageMask
                    image={bg}
                    text={'offline'}
                  />
                </div>
              </Transition>
          }
        </div>,
        controls: () => <div class='subscriber__stream-controls'>
          <StateBar
            userRole={this.userData?.role || StreamRole.OBSERVER}
            amount={this.publisherAccount?.amount || 0}
          />
        </div>,

        chat: () => <div class='subscriber__content'>
          <Chat
            chatName={this.publisher?.username || '-'}
            room={this.publisher?.streamId || 0}
            isRoomAvailable={this.isJoined}
          />
        </div>
      }}
      </RoomLayout>
  }

})
