import {
  defineComponent,
  ref,
  TransitionGroup,
  Transition,
  VNode,
  inject
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

/** layouts */
import RoomLayout from '@/layouts/Room/Room'

/**images */
import SmokeBg from '@/assets/images/taro-bg.jpg'

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

  setup () {

    const remoteStream = ref <MediaStream> ()
    const remoteVideoNode = ref <HTMLMediaElement> ()
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

    return {
      remoteStream,
      remoteVideoNode,
      constraints,
      chatPluginHandler,
      videoTrack,
      audioTrack,
      mountPoint,
      subscriberName,
      subscriberHandler
    }
  },

  data (): Data {
    return {
      publisher: null,
      publisherAccount: null,
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
      }
    },

    collapseVideo (event: Event) {
      const video = event.target as HTMLVideoElement
      video.play()
    },
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
              />
              </TransitionGroup>
            : <Transition name='offline'>
                <div class={'subscriber__publisher-avatar'}>
                  <ImageMask
                    image={SmokeBg}
                    text={'offline'}
                  />
                </div>
              </Transition>
          }
        </div>,
        controls: () => <div class='subscriber__stream-controls'>
          <StateBar
            userRole={this.userData.role || StreamRole.OBSERVER}
            amount={this.publisherAccount?.amount}
          />
        </div>,

        chat: () => <div class='subscriber__content'>
          <Chat
            chatName={this.userData.username}
            room={this.publisher?.streamId || 0}
          />
        </div>
      }}
      </RoomLayout>
  }

})
