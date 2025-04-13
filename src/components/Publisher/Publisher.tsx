
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

/** types */
import { UserRole, MediaDevice, publisherHandlerKey, chatKey, VideoErrorState } from '@/types/global'
import { PublisherStreamHandler } from '@/services/webrtc/webrtcPublisher'
import { States } from '@/types/store'
import { VideoRoomPluginError, ConnectionState } from '@/types/janus'

/** store */
import { mapActions, mapGetters } from 'vuex'

/** layout */
import RoomLayout from '@/layouts/Room/Room'

/** notifier */
import { useToast } from 'vue-toastification'

/**eventBus */
import emitter from '@/services/eventBus'

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
    }
  },

  setup () {
    const publisherNode = ref <HTMLMediaElement[]> ([])
    const clientNode = ref <HTMLVideoElement> ()
    const publisherStream = ref <MediaStream[]> ([])
    const clientStream = ref <MediaStream> ()
    const publisherId = ref<number>()

    const constraints: MediaStreamConstraints[] = [{
      audio: false,
      video: true
    }]

    const videoTrack = ref <MediaStreamTrack | null>()
    const audioTrack = ref <MediaStreamTrack | null> ()
    const crypto = inject<Crypto>('crypto')
    const publisherHandler = inject <PublisherStreamHandler | null> (publisherHandlerKey, null)
    const isStreamConfigured = ref<boolean> (false)
    const isLoading = ref<boolean>(false)
    const toast = useToast()
    const isDeviceConfigurationVisible = ref<boolean>(false)
    const isWebRTCConnected = ref<boolean>()
    const isHandlerConnected = ref<ConnectionState | null>(null)
    const secret = ref<string | null>(null)
    const isReadyToPrivate = ref<boolean>(false)

    return {
      publisherNode,
      clientNode,
      publisherStream,
      clientStream,
      publisherId,
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
      isReadyToPrivate
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

    publisherHandler (newValue: PublisherStreamHandler | null) {
      if (!newValue) {
        return
      }
      this.listenToEvents()
    },

    performanceNavigationType (newValue: NavigationTimingType | null) {
      if (newValue === 'reload') {
        this.isLoading = true

        setTimeout(() => {
          // this.reconnectStream()
        }, 2000)
      }
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

    getUserMedia (): Promise <void> {
      return Promise.all(this.constraints.map((item: MediaStreamConstraints) => {
        return navigator.mediaDevices.getUserMedia(item)
      })).then((streams: MediaStream[]) => {
        this.publisherStream = [...streams]
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

      /*
      setTimeout(async () => {
        const secret = await this.makeRoomPrivate()
        if (secret) {
          this.secret = secret
          this.reconnectStream()
        }
      }, 7000)
      */
    },

    getNewPublisherId (): number | null {
      if (!this.crypto) {
        return null
      }

      const randomBuffer = new Uint32Array(1)
      this.crypto.getRandomValues(randomBuffer)
      const fraction = randomBuffer[0]
      const publisherId = Math.floor(fraction * 6) + 1
      return publisherId
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

    listenToEvents (): void {
      emitter.on('janus-error', (err) => {
        if ((err as any) instanceof DOMException) {
          console.warn(err)
          return
        }
        
        this.isLoading = false
        // this.setVideoErrorState(err)
        // this.handleError(err)
      })

      emitter.on('janus-connectionState', (state) => {
        this.isHandlerConnected = state
        if (state === 'connected') {
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

      emitter.on('video-destroyed', () => {
        this.isLoading = false
        this.isStreamConfigured = false
        this.isHandlerConnected = 'disconnected'
        this.toast.info(this.$t('services.webrtc.info.reloadToStart'))
      })

      emitter.on('video-configured', isConfigured => {
        this.isStreamConfigured = isConfigured
      })

      emitter.on('janus-webrtcState', (state) => {
        this.isWebRTCConnected = state
      })

      emitter.on('video-unpublished', () => {
        this.isStreamConfigured = false
      })

      emitter.on('video-leaving', () => {
        this.isLoading = true
        this.destroyRoom()
      })

      emitter.on('video-edited', () => {
        this.isReadyToPrivate = !this.isReadyToPrivate
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

    async getConnectionState (): Promise <void> {
      if (!this.publisherHandler) {
        this.isHandlerConnected = 'disconnected'
        return
      }

      const connected = this.publisherHandler.isJanusConnected()
      this.isHandlerConnected = connected ? 'connected' : 'disconnected'
    },

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
        media: () => <div class="publisher-stream__publisher-video">
            <TransitionGroup>
              {
                this.publisherStream.map((stream: MediaStream, index: number) => {
                  return <BaseVideo
                    key={index}
                    srcObject={stream} 
                    autoplay
                    playsinline
                    pictureInPictureMode={!!index}
                  /> 
                })
              }
            </TransitionGroup>
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
        chat: () => <div class='publisher-stream__chat'>
          { 
            <Chat
              isReadyToPrivate={this.isReadyToPrivate}
              secret={this.secret}
              room={this.userData.streamId}
              chatName={this.userData.username || 'no-name'}
              isStreamAvailable={this.isStreamConfigured}
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
