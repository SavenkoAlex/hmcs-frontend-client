import {
  defineComponent,
  ref,
  Transition,
  VNode,
  inject,
  useTemplateRef
} from 'vue'

/** store */
import { mapGetters } from 'vuex'

import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'
import { ChatHandler } from '@/services/webrtc/webrtcDataExchange'

/** style */
import '@/components/Subscriber/Subscriber.scss'

/** components */
import Chat from '@/components/Chat/Chat'
import BaseVideo from '@/components/Video/Video'
import StateBar from '@/components/StateBar/StateBar'
import ImageMask from '@/components/general/ImageMask/ImageMask'
import Loader from '@/components/general/Loader/Loader' 

/** api */
import userApi from '@/api/user'

/** types */
import { Data } from '@/components/Subscriber/types'
import { UserRole, chatKey, videoHandlerKey } from '@/types/global'
import { VideoRoomPluginError } from '@/types/janus'

/** layouts */
import RoomLayout from '@/layouts/Room/Room'

/**images */
import bg from '@/assets/images/taro-bg.jpg'

/** notifier */
import { useToast } from 'vue-toastification'

/* locales */

/** event bus */
import eventBus from '@/services/eventBus'

import { I18n, useI18n } from 'vue-i18n'
import { States } from '@/types/store'

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
    ...mapGetters(States.USER, ['userData']),
    ...mapGetters(States.APP, ['performanceNavigationType']),

    publisherId () {
      const publisherId: string | undefined = Array.isArray(this.$route.params?.id) 
        ? this.$route.params.id[0]
        : this.$route.params.id as string

      if (!publisherId) {
        return null
      }

      return publisherId
    },

    publisherName (): string {
      return this.publisher?.username ?? '-'
    },

    streamId (): number {
      return this.publisher?.streamId ?? 0
    }
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
    },
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
    const subscriberHandler = inject <SubscriberStreamHandler | null> (videoHandlerKey, null)
    const chatPluginHandler = inject <ChatHandler | null> (chatKey, null)
    const videoTrack = ref <MediaStreamTrack | null>()
    const audioTrack = ref <MediaStreamTrack | null> ()
    const toast = useToast()
    const isJoined = ref <boolean> (false)
    const { t } = useI18n()

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
      isJoined,
      t
    }
  },

  data (): Data {
    return {
      publisher: null,
      publisherAccount: null,
      isLoading: false
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
        //Janus.attachMediaStream(this.remoteVideoNode, this.remoteStream)
        this.isJoined = true
      }
      this.isLoading = false
    },

    onClosed () {
      this.isJoined = false
    },

    collapseVideo (event: Event) {
      const video = event.target as HTMLVideoElement
      video.play()
    },

    onError (error: VideoRoomPluginError | Error) {
      this.isLoading = false

      if (error instanceof DOMException) {
        return
      }

      switch (error) {
        case VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_NO_SUCH_FEED:
          this.toast(this.t('services.webrtc.info.noFeed'))
          break;

        default: 
          this.toast(this.t('services.webrtc.errors.canNotConnectStream'))
      }
    },

    onJoined () {
      this.isJoined = true
    },

    addListeners () {
      eventBus.on('janus-onremotetrack', data => this.onremotetrack(data))
      eventBus.on('janus-error', error => this.onError(error))
      eventBus.on('video-attached', () => this.onJoined())
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
      this.subscriberHandler?.connect(this.publisher.streamId)
    }

  },

  async unmounted () {
    await this.subscriberHandler?.leave()
  },

  render (): VNode {
    return <RoomLayout>
      {{
        media: () => <div class="subscriber__publisher-media">
          { this.remoteStream 
            
            ? <Transition>
              <BaseVideo
                srcObject={this.remoteStream}
                autoplay
                playsinline
                ref={'video'}
              />
              </Transition>
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
        controls: () => <StateBar
          userRole={this.userData?.role || UserRole.ANONYMOUS}
          amount={this.publisherAccount?.amount || 0}
        />,
        chat: () => <div class='subscriber__content'>
          <Chat
            chatName={this.publisherName || '-'}
            room={this.publisher?.streamId || 0}
            isStreamAvailable={this.isJoined}
          />
        </div>,
        default: () => <div>
          <Loader isVisible={this.isLoading }/>
        </div>
      }}
      </RoomLayout>
  }

})
