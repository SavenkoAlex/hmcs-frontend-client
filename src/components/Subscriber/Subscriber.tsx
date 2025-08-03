import {
  defineComponent,
  ref,
  Transition,
  VNode,
  inject,
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

/** types */
import { Data } from '@/components/Subscriber/types'
import { UserRole, chatKey, subscriberHandlerKey, publisherHandlerKey } from '@/types/global'
import { VideoRoomPluginError, PluginsErrors } from '@/types/janus'

/** layouts */
import RoomLayout from '@/layouts/Room/Room'

/**images */
import bg from '@/assets/images/taro-bg.jpg'

/** notifier */
import { useToast } from '@/services/toast/toast'

/* locales */
import { I18n, useI18n } from 'vue-i18n'
import { States } from '@/types/store'

/** services */
import { MessageHandler, MessageType } from '@/services/MessageHandler/MessageHandler'

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
      if (!this.remoteStream) {
        return 'subscriber__media_disabled'
      }
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
    },

    publisherAvatarClass (): string {
      if (this.remoteStream) {
        return 'publisher__avatar_disabled'
      }
      return 'publisher__avatar'
    },

    chatRoom (): number {
      if (!this.remoteStreamId) {
        return 0
      }
      return (this.remoteStreamId + 1) * 1000
    }
  },

  watch: {
    subscriberHandler: {
      handler: function (newValue) {
        if (!newValue || !newValue?.handlerInstance?.id) {
          return
        }

        if (this.needToReconnectStream) {
          newValue.connect(this.remoteStreamId)
          this.needToReconnectStream = false
        }

        this.addListeners()
      },
      immediate: true
    },

    remoteStreamId: {
      handler: function (newValue, oldValue) {
        if (newValue === oldValue) {
          return
        }
        this.needToReconnectStream = true
        this.needToReconnectChat = true
      },
      immediate: true
    },


    chatPluginHandler: {
      handler (newValue: ChatHandler | null) {
        if (!newValue) {
          return
        }

        if (this.needToReconnectChat && this.remoteStreamId) {
          newValue.register('me', this.remoteStreamId)
          this.needToReconnectChat = false
        }
      },
      immediate: true
    },

    publisherHandler: {
      handler (newValue) {
        if (!newValue || !this.videoTrack) {
          return
        }
        this.listenToPublisher()
        this.publisherHandler?.connect(this.videoTrack, this.userData?.streamId)
      },
    },

    subscriberStream (newValue : MediaStream | MediaStream[] |null) {
      if (!newValue) {
        this.videoTrack = null
        this.audioTrack = null
        return
      }

      if (Array.isArray(newValue)) {
        this.videoTrack = newValue[0].getVideoTracks()[0]
        this.audioTrack = newValue[0].getAudioTracks()[0]
        return
      }

      this.videoTrack = newValue.getVideoTracks()[0]
      this.audioTrack = newValue.getAudioTracks()[0]
    },
  },

  setup () {

    const remoteStream = ref <MediaStream> ()
    const subscriberStream = ref <MediaStream> ()

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
    const toast = useToast()
    const isJoined = ref <boolean> (false)
    const { t } = useI18n()
    const isMediaLocationChanged = ref <boolean> (false)

    return {
      remoteStream,
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
    }
  },

  data (): Data {
    return {
      isLoading: false,
      needToReconnectStream: false,
      needToReconnectChat: false
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
      //const video = event.target as HTMLVideoElement
      //video.play()
    },

    onError (error: PluginsErrors | Error) {
      this.isLoading = false

      if (error instanceof DOMException) {
        return
      }

      switch (error) {
        case VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_NO_SUCH_FEED:
          this.toast.error(this.t('services.webrtc.info.noFeed'))
          break;

        default: 
          this.toast.error(this.t('services.webrtc.errors.canNotConnectStream'))
      }
    },

    onJoined () {
      this.isJoined = true
    },

    addListeners () {
      this.subscriberHandler?.emitter.on('janus-onremotetrack', data => this.onremotetrack(data))
      this.subscriberHandler?.emitter.on('janus-error', error => this.onError(error))
      this.subscriberHandler?.emitter.on('video-attached', () => this.onJoined())
    },

    listenToPublisher () {
      this.publisherHandler?.emitter?.on('video-configured', async () => {
        console.log('subscriber - configured')
        this.publisherHandler?.createStream()
      })

      this.publisherHandler?.emitter?.on('video-publisher_joined', () => {
        this.publisherHandler?.createStream()
      })
    },

    async getUserMedia (): Promise <void> {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(this.constraints)
        this.subscriberStream = stream
      } catch (err) {
        console.error(err)
      }
    },

    async onRequestPublish (): Promise <void> {
      if (!this.$route.params.id) {
        return 
      }
      const mountPoint = Number.parseInt(this.$route.params.id, 10)
      
      if (!mountPoint) {
        return
      }

      if (!this.subscriberStream) {
        await this.getUserMedia()
      }

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
      
      this.subscriberHandler?.emitter?.emit('add-publisher', mountPoint)
    },

    async sendPrivateStreamOffer () {
      if (!this.chatPluginHandler) {
        console.warn('no chat plugin handler')
        return 
      }

      if (!this.chatRoom) {
        return
      }

      const message = MessageHandler.packMessage(MessageType.JOINREQUEST)

      if (!message || !this.remoteStreamId) {
        console.warn('no message')
        return
      }

      this.chatPluginHandler.sendMessage(message, this.chatRoom)
    }
  },

  mounted () {
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
            <Transition>
              <BaseVideo
                srcObject={this.remoteStream}
                autoplay
                playsinline
              />
            </Transition>
            <Transition name='offline'>
              <div class={this.publisherAvatarClass}>
                <ImageMask
                  image={bg}
                  text={'offline'}
                />
              </div>
            </Transition>
          </div>
          <div class={this.subscriberMediaClass}>
            { 
              <Transition>
                <BaseVideo
                  srcObject={this.subscriberStream}
                  autoplay
                  playsinline
                  pictureInPictureMode
                  onDbclick={this.collapseVideo}
                />
              </Transition>
            }
          </div>
        </div>,
        controls: () => <StateBar
          userRole={this.userRole}
          amount={this.userAmount}
          onPublish={this.sendPrivateStreamOffer}
        />,
        chat: () => <div class='subscriber__content'>
          {
            this.remoteStreamId && <Chat
              chatName={this.publisherName || '-'}
              room={this.chatRoom}
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
