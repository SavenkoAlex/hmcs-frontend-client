
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
import { UserRole, MediaDevice, pubKey, chatKey, VideoErrorState } from '@/types/global'
import { PublisherStreamHandler } from '@/services/webrtc/webrtcPublisher'
import { ChatHandler } from '@/services/webrtc/webrtcDataExchange'
import { States } from '@/types/store'
import { webRTCEventJanusMap, AttachEvent, VIDEO_ROOM_PLUGIN_EVENT, VideoRoomPluginError } from '@/types/janus'

/** store */
import { mapActions, mapGetters } from 'vuex'

/** layout */
import RoomLayout from '@/layouts/Room/Room'

/** notifier */
import { useToast } from 'vue-toastification'

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
    ...mapGetters(States.APP, ['devices', 'performanceNavigationType', 'videoErrorState']),
    ...mapGetters(States.USER, ['userData']
    ),
    
    isHandlerAvailable (): boolean {
      return !!this.publisherHandler
    },
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
    const publisherHandler = inject <PublisherStreamHandler | null> (pubKey, null)
    const chatHandler = inject <ChatHandler | null> (chatKey, null)
    const isStreamActive = ref<boolean> (false)
    const isLoading = ref<boolean>(false)
    const toast = useToast()
    const isDeviceConfigurationVisible = ref<boolean>(false)

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
      chatHandler,
      isLoading,
      isStreamActive,
      toast,
      isDeviceConfigurationVisible
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

    publisherHandler : {
      handler: function (newValue: PublisherStreamHandler | null) {
        if (!newValue) {
          return
        }
        this.listenToEvents()
      },
      immediate: true
    },

    performanceNavigationType (newValue: NavigationTimingType | null) {
      if (newValue === 'reload') {
        this.isLoading = true
        this.isStreamActive = false

        setTimeout(() => {
          this.reconnectStream()
        }, 2000)
      }
    },

    videoErrorState (newValue) {
      if (!newValue) {
        return
      }
      this.executeAction(newValue)
    }
  },

  methods: {
    ...mapActions(States.APP, ['setDevice', 'clearDevices', 'setVideoErrorState']),

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

      this.isLoading = true
      const destryed = await this.publisherHandler.leave()
      this.isLoading = false

      if (!destryed) {
        this.toast.error(this.$t('services.webrtc.errors.canNotStopStream'))
      }
    },

    async startStream (): Promise <void> {
      
      if (!this.publisherHandler) {
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
        this.setVideoErrorState(startResult.errorCode ? startResult.errorCode : VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_UNKNOWN)
      }
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
      if (this.isStreamActive) {
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
      this.publisherHandler?.emitter.on(webRTCEventJanusMap[AttachEvent.ERROR], err => {
        this.setVideoErrorState(err)
        this.isLoading = false
      })

      this.publisherHandler?.emitter.on(VIDEO_ROOM_PLUGIN_EVENT.PUB_JOINED, () => {
        this.isStreamActive = true
        this.isLoading = false
      })

      this.publisherHandler?.emitter.on(VIDEO_ROOM_PLUGIN_EVENT.DESTROYED, () => {
        this.isStreamActive = false
      }) 
    },

    async reconnectStream (): Promise <void> {
      this.isLoading = true
      if (!this.publisherHandler) {
        this.isLoading = false
        // TODO start timeout again
        return
      }

      const isRoomExists = await this.publisherHandler.isStreamAvailable()
      
      if (!isRoomExists || !this.videoTrack) {
        this.isLoading = false
        return
      }

      this.publisherHandler.reconnect(this.videoTrack)
    },

    executeAction (videoErrorState: VideoErrorState): void {
      if (!videoErrorState) {
        return
      }

      switch (videoErrorState.state) {
        
        case VideoRoomPluginError.JANUS_VIDEOROOM_ERROR_NOT_IN_A_ROOM:
          this.toast(this.$t('services.webrtc.info.tryToRestartStream'))
          return

        case VideoRoomPluginError.ROOM_ALREADY_EXISTS:
          this.reconnectStream()
          return 

        default:
          this.toast.error(this.$t('services.webrtc.errors.commonStreamError'))
          return
      }
    },
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

  unmounted() {
    this.publisherHandler?.emitter.removeAllListeners()
    this.publisherHandler?.leave()
  },


  render (): VNode {
    return <RoomLayout>
      {{
        media: () => <div class="publisher-stream__publisher-video">
            <TransitionGroup>
              {
                this.publisherStream.map((stream: MediaStream, index: number) => {
                  return <BaseVideo
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
          isStreamActive={this.isStreamActive}
          onMuteVideo={(muted) => muted ? this.muteVideo() : this.unMuteVideo()}
          onMuteAudio={(muted) => muted ? this.muteAudio() : this.unMuteAudio()}
          onApplydevices={() => this.applyDevices()}
          onShowdevicesconfiguration={() => this.isDeviceConfigurationVisible = true}
        />,
        chat: () => <div class='publisher-stream__chat'>
          { 
            <Chat
              room={this.userData.streamId}
              chatName={this.userData.username || 'no-name'}
              isStreamAvailable={this.isStreamActive}
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
