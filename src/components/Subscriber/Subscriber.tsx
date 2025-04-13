import {
  defineComponent,
  ref,
  Transition,
  VNode,
  inject,
  useTemplateRef
} from 'vue'

/** store */
import { mapGetters, mapActions } from 'vuex'

import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'
import {  PublisherStreamHandler } from '@/services/webrtc/webrtcPublisher'
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
import { UserRole, chatKey, subscriberHandlerKey, publisherHandlerKey } from '@/types/global'
import { VideoRoomPluginError, PluginsErrors } from '@/types/janus'

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
    ...mapGetters(States.USER, ['userData', 'userAmount']),
    ...mapGetters(States.APP, ['performanceNavigationType']),

    /*
    publisherId () {
      const publisherId: string | undefined = Array.isArray(this.$route.params?.id) 
        ? this.$route.params.id[0]
        : this.$route.params.id as string

      if (!publisherId) {
        return null
      }

      return publisherId
    },
    */

    remoteStreamId (): number | null {
      const streamId: string | undefined = Array.isArray(this.$route.params?.id) 
        ? this.$route.params.id[0]
        : this.$route.params.id as number

      if (!streamId) {
        return null
      }

      return Number.parseInt(streamId, 10) 
    },

    publisherName (): string {
      return '-'
    },

    userRole (): UserRole.USER | UserRole.WORKER | UserRole.ANONYMOUS {
      if (this.userData?.role === UserRole.USER) {
        return UserRole.USER
      }
      return UserRole.ANONYMOUS
    },

    publisherMediaClass (): string {
      return this.isMediaLocationChanged
        ? 'subscriber__media_small'
        : 'subscriber__media_large'
    },

    subscriberMediaClass (): string {
      if (!this.subscriberStream) {
        return 'subscriber__media_disabled'
      }

      return this.isMediaLocationChanged
        ? 'subscriber__media_large'
        : 'subscriber__media_small'
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
    const remoteVideoNode = useTemplateRef <HTMLMediaElement> ('remote-video')
    const localVideoNode = useTemplateRef <HTMLMediaElement> ('local-video')

    const constraints = {
      audio: false,
      video: true
    }
    const subscriberName = ref <string>('sasha the programmer')
    const mountPoint = ref <number> ()
    const subscriberHandler = inject <SubscriberStreamHandler | null> (subscriberHandlerKey, null)
    const chatPluginHandler = inject <ChatHandler | null> (chatKey, null)
    const publisherHandler = inject <PublisherStreamHandler | null> (publisherHandlerKey, null)
    const videoTrack = ref <MediaStreamTrack | null>()
    const audioTrack = ref <MediaStreamTrack | null> ()
    const subscriberStream = ref <MediaStream | null> (null)
    const toast = useToast()
    const isJoined = ref <boolean> (false)
    const { t } = useI18n()
    const isMediaLocationChanged = ref <boolean> (false)

    return {
      remoteStream,
      remoteVideoNode,
      constraints,
      chatPluginHandler,
      videoTrack,
      audioTrack,
      mountPoint,
      subscriberName,
      subscriberStream,
      subscriberHandler,
      publisherHandler,
      toast,
      isJoined,
      t,
      isMediaLocationChanged,
      localVideoNode
    }
  },

  data (): Data {
    return {
      isLoading: false
    }
  },

  methods: {

    ...mapActions('user', ['setUserProperty']),
    ...mapActions('app', ['setDevice']),

    onremotetrack (descripption: {on: boolean, track: MediaStreamTrack}) {
      const { track } = descripption
      this.remoteStream = new MediaStream([track])
      this.isLoading = false
    },

    onClosed () {
      this.isJoined = false
    },

    collapseVideo (event: Event) {
      const video = event.target as HTMLVideoElement
      video.play()
    },

    onError (error: PluginsErrors | Error) {
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
    },

    async getUserMedia (): Promise <void> {
      navigator.mediaDevices.getUserMedia(this.constraints).then((stream: MediaStream) => {
        this.subscriberStream = stream
      })
    },

    async onRequestPublish (): Promise <void> {
      if (!this.$route.params.id) {
        return 
      }
      const mountPoint = Number.parseInt(this.$route.params.id, 10)
      
      if (!mountPoint) {
        return
      }
      await this.getUserMedia()

      if (!this.subscriberStream) {
        return
      }

      this.subscriberStream.getTracks().forEach(track => {
        const deviceId = track.getSettings().deviceId
        if (deviceId) {
          this.setDevice({
            kind: track.kind,
            label: track.label,
            deviceId: deviceId,
            muted: track.muted,
            selected: true
          })
        }
      })
      eventBus.emit('add-publisher', mountPoint)
    }
  },

  async mounted () {
    if (this.remoteStreamId) {
      this.subscriberHandler?.connect(this.remoteStreamId)
    }
  },

  async unmounted () {
    await this.subscriberHandler?.leave()
  },


  render (): VNode {
    return <RoomLayout>
      {{
        media: () => <div class="subscriber__media">
          <div class={this.publisherMediaClass}>
            { this.remoteStream 
            
              ? <Transition>
                <BaseVideo
                  srcObject={this.remoteStream}
                  autoplay
                  playsinline
                  ref={'remote-video'}
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
          </div>
          <div class={this.subscriberMediaClass}>
            { 
              this.subscriberStream && <Transition>
                <BaseVideo
                  srcObject={this.subscriberStream}
                  autoplay
                  playsinline
                  ref={'local-video'}
                />
              </Transition>
            }
          </div>
        </div>,
        controls: () => <StateBar
          userRole={this.userRole}
          amount={this.userAmount}
          onPublish={this.onRequestPublish}
        />,
        chat: () => <div class='subscriber__content'>
          {
            this.remoteStreamId && <Chat
              chatName={this.publisherName || '-'}
              room={this.remoteStreamId}
              isStreamAvailable={this.isJoined}
            />
          }
        </div>,
        default: () => <div>
          <Loader isVisible={this.isLoading }/>
        </div>
      }}
      </RoomLayout>
  }
})
