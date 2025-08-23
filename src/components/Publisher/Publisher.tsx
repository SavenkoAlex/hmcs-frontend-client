
import {
  defineComponent,
  VNode,
  ref,
  inject,
  TransitionGroup,
} from 'vue'

// style
import './Publisher.scss'

/** components */
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import StateBar from '@/components/StateBar/StateBar'
import Chat from '@/components/Chat/Chat'
import BaseVideo from '@/components/Video/Video'
import Loader from '@/components/general/Loader/Loader' 
import DeviceConfigurationModal from '@/components/DeviceController/DeviceConfigurationModal'
import Skeleton from 'primevue/skeleton'

/** types */
import { UserRole, MediaDevice, publisherHandlerKey, VideoErrorState, subscriberHandlerKey } from '@/types/global'
import { PublisherStreamHandler } from '@/services/webrtc/webrtcPublisher'
import { States } from '@/types/store'
import { 
  VideoRoomPluginError, 
  ConnectionState, 
  LeavMessage, 
  PublisherDescription, 
} from '@/types/janus'
import { JanusJS } from 'janus-gateway'

/** store */
import { mapActions, mapGetters } from 'vuex'

/** layout */
import RoomLayout from '@/layouts/Room/Room'

/** notifier */
import { useToast } from '@/services/toast/toast';

/**eventBus */
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'

export default defineComponent({

  name: 'Publisher',

  emits: ['inithandler'],

  components: {
    TextButton,
    Chat,
    BaseVideo,
    RoomLayout,
    Loader,
    DeviceConfigurationModal
  },

  computed: {
    ...mapGetters(States.APP, [
      'devices', 
      'performanceNavigationType', 
      'videoErrorState', 
      'isVideoHandlerAvailable',
      'isChatHandlerAvailable'
    ]),
    ...mapGetters(States.USER, ['userData']
    ),

    isStartStreamButtonDisabled () {
      if (this.isHandlerConnected === null) {
        return false
      }

      return this.isHandlerConnected !== 'connected'
    },

    localMediaClass (): string {
      return 'publisher__media_large'
    },

    remoteMediaClass (): string {
      return this.clientStream ? 'publisher__media_small' : 'publisher__media_disabled' 
    },

    chatRoom (): number {
      if (!this.userData?.streamId) {
        return 0
      }

      return (this.userData.streamId + 1) * 1000
    }
  },

  setup () {
    const publisherNode = ref <HTMLMediaElement[]> ([])
    const clientNode = ref <HTMLVideoElement> ()
    const publisherStream = ref <MediaStream[]> ([])
    const clientStream = ref <MediaStream> ()

    const constraints: MediaStreamConstraints[] = [{
      audio: false,
      video: true
    }]

    const videoTrack = ref <MediaStreamTrack | null>()
    const audioTrack = ref <MediaStreamTrack | null> ()
    const crypto = inject<Crypto>('crypto')
    const publisherHandler = inject <PublisherStreamHandler | null> (publisherHandlerKey, null)
    const subscriberHandler = inject <SubscriberStreamHandler | null> (subscriberHandlerKey, null)
    const isStreamConfigured = ref<boolean> (false)
    const isLoading = ref<boolean>(false)
    const toast = useToast()
    const isDeviceConfigurationVisible = ref<boolean>(false)
    const isWebRTCConnected = ref<boolean>()
    const isHandlerConnected = ref<ConnectionState | null>(null)
    const secret = ref<string | null>(null)
    const isReadyToPrivate = ref<boolean>(false)
    const publishers = ref <Record <number, PublisherDescription>> ({})

    return {
      publisherNode,
      clientNode,
      publisherStream,
      clientStream,
      constraints,
      videoTrack,
      audioTrack,
      crypto,
      publisherHandler,
      isLoading,
      isStreamConfigured,
      toast,
      isDeviceConfigurationVisible,
      isWebRTCConnected,
      isHandlerConnected,
      secret,
      isReadyToPrivate,
      subscriberHandler,
      publishers
    }
  },

  watch: {
    publisherStream (newValue : MediaStream[] | null) {
      if (!newValue || !newValue.length) {
        this.videoTrack = null
        this.audioTrack = null
        return
      }

      this.videoTrack = newValue[0].getVideoTracks()[0]
      this.audioTrack = newValue[0].getAudioTracks()[0]
    },

    'publisherHandler.isHandlerEstbilished': {
      handler: function (newValue: PublisherStreamHandler | null) {
        if (!newValue) {
          return
        }
        this.listenToEvents()
      },
      immediate: true
    },

    'subscriberHandler.isHandlerEstbilished': {
      handler: function (newValue: SubscriberStreamHandler | null) {
        if (!newValue) {
          return
        }

        if (!this.userData?.streamId) {
          return
        }

        this.listenToSubscriber()
      },
      immediate: true
    },

    performanceNavigationType (newValue: NavigationTimingType | null) {
      //TODO: do something
    },

    videoErrorState (newValue) {
      if (!newValue) {
        return
      }
      this.executeAction(newValue)
    },
  },

  methods: {
    ...mapActions(States.APP, [
      'setDevice', 
      'clearDevices', 
      'setVideoErrorState',
    ]),

    async getUserMedia (): Promise <void> {
      return Promise.all(this.constraints.map((item: MediaStreamConstraints) => {
        return navigator.mediaDevices.getUserMedia(item)
      })).then((streams: MediaStream[]) => {
        this.publisherStream = streams
      })
    },

    applyDevices (): void {
      const devicesArray: MediaDevice[] = Object.values(this.devices)
      const videoTracks = devicesArray.filter((item: MediaDevice) => item.selected && item.kind === 'videoinput')
      const audioTracks = devicesArray.filter((item: MediaDevice) => item.selected && item.kind === 'audioinput')

      this.constraints = videoTracks.map((item: MediaDevice, index: number) => {
        return {
          video: {
            deviceId: item.deviceId
          },
          audio: index ? false : {
            deviceId: audioTracks[0].deviceId
          }
        }
      })
      
      this.getUserMedia()
    },

    /**
     * destroy room request
     * @returns 
     */
    async destroyRoom (): Promise <void> {
      if (!this.publisherHandler) {
        console.error('no webrtc plugin availabell')
        this.toast.error(this.$t('services.webrtc.errors.webRTCIsNotAvailable'))
        return
      }
      const destroyed = await this.publisherHandler.destroy()
      
      if (!destroyed) {
        this.toast.error(this.$t('services.webrtc.errors.canNotStopStream'))
      }
    },

    async startStream (): Promise <void> {
      
      if (!this.publisherHandler || (this.isHandlerConnected !== 'connected' && this.isHandlerConnected !== null) ) {
        this.toast.error(this.$t('services.webrtc.errors.webRTCIsNotAvailable'))
        console.error('no webrtc plugin availabele')
        return
      }

      if (!this.videoTrack) {
        this.toast.error(this.$t('services.webrtc.errors.userVideoIsNotAvailable'))
        console.error('local video not detected')
        return
      }

      this.isLoading = true

      const startResult = await this.publisherHandler.connect(this.videoTrack)

      if (!startResult.success) {
        this.isLoading = false
        this.setVideoErrorState(startResult.errorCode ? startResult.errorCode : VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN_ERROR)
        this.toast.error(this.$t('services.webrtc.errors.canNotStartStream'))
        return
      }
    },

    toggleStream (): void {
      if (this.isStreamConfigured) {
        this.destroyRoom()
        return
      }

      this.startStream()
    },

    muteVideo (): void {
      this.publisherStream?.forEach(stream => stream.getVideoTracks().forEach(track => track.enabled = false))
    },

    unMuteVideo (): void {
      this.publisherStream?.forEach(stream => stream.getVideoTracks().forEach(track => track.enabled = true))
    },

    muteAudio (): void {
      this.publisherStream?.forEach(stream => stream.getAudioTracks().forEach(track => track.enabled = false))
    },

    unMuteAudio (): void {
      this.publisherStream?.forEach(stream => stream.getAudioTracks().forEach(track => track.enabled = true))
    },

    acceptStreams (publishers: {id: number}[]): void {
      for (const publisher of publishers) {
        this.subscriberHandler?.connect(this.userData?.streamId, publisher.id)
      }
    },

    listenToEvents (): void {
      this.publisherHandler?.emitter.on('janus-error', (err) => {
        if ((err as any) instanceof DOMException) {
          console.warn(err)
          return
        }
        
        this.isLoading = false
        // this.setVideoErrorState(err)
        // this.handleError(err)
      })

      this.publisherHandler?.emitter.on('janus-connectionState', (state) => {
        this.isHandlerConnected = state
        if (state === 'connected') {
          console.log('connected connected')
          this.toast.success(this.$t('services.webrtc.success.webRTCIsAvailable'))
        } else if (state === 'failed') {
          this.toast.error(this.$t('services.webrtc.errors.webRTCIsNotAvailable'))
        }  else if (state === 'disconnected') {
          this.toast.info(this.$t('services.webrtc.info.webRTCIisDisconnected'))
        } else if (state === 'connecting') {
          return
        }
        this.isLoading = false
      })

      this.publisherHandler?.emitter.on('video-destroyed', () => {
        this.isLoading = false
        this.isStreamConfigured = false
        this.isHandlerConnected = 'disconnected'
        this.toast.info(this.$t('services.webrtc.info.reloadToStart'))
      })

      this.publisherHandler?.emitter.on('video-configured', isConfigured => {
        this.isStreamConfigured = isConfigured
      })

      this.publisherHandler?.emitter.on('janus-webrtcState', (state) => {
        this.isWebRTCConnected = state
      })

      this.publisherHandler?.emitter.on('video-unpublished', () => {
        console.log('someone left')
      })

      this.publisherHandler?.emitter.on('video-leaving', (msg: LeavMessage) => {

        const who = msg?.display || 'unknown user'
        const whoId = msg?.leaving

        if (whoId !== this.userData?.streamId) {
          this.toast.info(who + ' ' + this.$t('services.webrtc.info.hasLeft'))
          return
        }
        
        this.isLoading = true
        this.destroyRoom()
      })

      this.publisherHandler?.emitter.on('video-edited', () => {
        this.isReadyToPrivate = !this.isReadyToPrivate
      })

      this.publisherHandler?.emitter.on('janus-onremotetrack', ({ track, mid, on, metadata }) => {
        this.clientStream = new MediaStream([track])
      })
      

      this.publisherHandler?.emitter.on('janus-success', () => {
       this.isLoading = false 
      })

      this.publisherHandler?.emitter.on('video-publishers', (msg) => {
        const newPublishers = []
        for (const publisher of msg?.publishers) {
          if (this.publishers[publisher.id]) {
            continue
          }

          newPublishers.push({ id: publisher?.id, display: publisher?.display })
        }
        this.acceptStreams(newPublishers)
      })
    },

    listenToSubscriber (): void {
      this.subscriberHandler?.emitter.on('janus-onremotetrack', ({ track, mid, on, metadata }) => {
        this.clientStream = new MediaStream([track])
      })
    },

    async reconnectStream (): Promise <void> {
      this.isLoading = true
      if (!this.publisherHandler) {
        this.isLoading = false
        // TODO start timeout again
        return
      }

      const isRoomExists = await this.publisherHandler.isRoomExists()
      
      if (!isRoomExists || !this.videoTrack) {
        this.toast.info(this.$t('services.webrtc.info.tryToRestartStream'))
        this.isLoading = false
        return
      }

      this.publisherHandler.reJoin(this.videoTrack, this.secret || undefined)
    },

    executeAction (videoErrorState: VideoErrorState): void {
      if (!videoErrorState) {
        return
      }

      switch (videoErrorState.state) {
        
        default:
          this.toast.error(this.$t('services.webrtc.errors.commonStreamError'))
          return
      }
    },

/**
 * Handles errors based on the provided error code.
 * If the error code indicates that the stream is already published,
 * it attempts to reconnect the stream. For other error codes,
 * it displays a common stream error message.
 * 
 * @param errCode - The error code to handle.
 */

    async handleError (errCode: unknown): Promise <void> {
      switch (errCode) {
        case VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_ALREADY_PUBLISHED:
          this.reconnectStream()
          return

        default:
          this.toast.error(this.$t('services.webrtc.errors.commonStreamError'))
      }
    },

    async makeRoomPrivate (): Promise <void | string> {
      if (!this.publisherHandler) {
        return
      }

      const secret = await this.publisherHandler.createPrivateSession(!this.isReadyToPrivate)

      if (!secret) {
        this.toast.error(this.$t('services.webrtc.errors.canNotStartPrivate'))
        return
      }

      return secret
    },

    onJoinRequest (msg: JanusJS.Message) {
      console.log('on join request', msg)
    }
  },

  async mounted () {
    this.getUserMedia().then(() => {

      this.publisherStream.forEach(stream => stream.getTracks().forEach(track => {
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
      }))
    })
  },

  render (): VNode {
    return <RoomLayout>
      {{
        media: () => <div class="publisher__media">
          <div class={this.localMediaClass}>
              {
                this.publisherStream.map((stream: MediaStream, index: number) => <BaseVideo
                  key={index}
                  srcObject={stream} 
                  autoplay
                  playsinline
                  pictureInPictureMode={!!index}
                />)
              }
            </div>
            <div class={this.remoteMediaClass}>
              <BaseVideo
                srcObject={this.clientStream} 
                autoplay
                playsinline
                pictureInPictureMode
              /> 
            </div>
          </div>,
        controls: () => <StateBar 
          userRole={UserRole.WORKER}
          onStreamtoggle={() => this.toggleStream()}
          isStreamActive={this.isStreamConfigured}
          isStartStreamDisabled={this.isStartStreamButtonDisabled}
          onMuteVideo={(muted) => muted ? this.muteVideo() : this.unMuteVideo()}
          onMuteAudio={(muted) => muted ? this.muteAudio() : this.unMuteAudio()}
          onApplydevices={() => this.applyDevices()}
          onShowdevicesconfiguration={() => this.isDeviceConfigurationVisible = true}
        />,
        chat: () => <div class='publisher__chat'>
          { 
            <Chat
              isReadyToPrivate={this.isReadyToPrivate}
              secret={this.secret}
              room={this.chatRoom}
              chatName={this.userData.username || 'no-name'}
              isStreamAvailable={this.isStreamConfigured}
              onJoin-request={this.onJoinRequest}
            />
          }
        </div>,
        default: () => <div>
          <DeviceConfigurationModal
            isModalVisible={this.isDeviceConfigurationVisible}
            onApplydevices={() => this.applyDevices}
            onClosedevicesconfiguration={ () => this.isDeviceConfigurationVisible = false }
          />
          <Loader isVisible={this.isLoading }/>
        </div>
    }}
    </RoomLayout>
  }
})
