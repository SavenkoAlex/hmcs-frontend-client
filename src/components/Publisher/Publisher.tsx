
import {
  defineComponent,
  VNode,
  ref,
  inject,
  Transition,
  TransitionGroup
} from 'vue'

// janus
import Janus from 'janus-gateway'
import { PublisherStreamHandler } from '@/services/webrtc/webrtcPublisher'

// style
import './Publisher.scss'

/** components */
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import StateBar from '@/components/StateBar/StateBar'
import Chat from '@/components/Chat/Chat'
import BaseVideo from '@/components/Video/Video'

/** types */
import { UserRole, MediaDevice } from '@/types/global'

/** store */
import { mapActions, mapGetters } from 'vuex'

/** layout */
import RoomLayout from '@/layouts/Room/Room'

export default defineComponent({

  name: 'Publisher',

  components: {
    TextButton,
    Chat,
    BaseVideo,
    RoomLayout
  },

  computed: {
    ...mapGetters('app', ['devices']),
    ...mapGetters('user', ['getUser']),
    isHandlerAvailable (): boolean {
      return !!this.pluginHandler
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

    const pluginHandler = ref <PublisherStreamHandler | null> (null)
    const videoTrack = ref <MediaStreamTrack | null>()
    const audioTrack = ref <MediaStreamTrack | null> ()
    const crypto = inject<Crypto>('crypto')

    const isRoomCreated = ref<boolean> (false)

    return {
      publisherNode,
      clientNode,
      publisherStream,
      clientStream,
      publisherId,
      constraints,
      pluginHandler,
      videoTrack,
      audioTrack,
      crypto,
      isRoomCreated,
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
  },

  methods: {
    ...mapActions('app', ['setDevice', 'clearDevices']),
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

    async initHandler (): Promise <boolean> {

      const publisherId  = this.getNewPublisherId()
      const { streamId = null } = this.getUser

      if (!streamId || !publisherId) {
        console.error('Can not generate id')
        return false
      }

      this.publisherId = publisherId
    
      return PublisherStreamHandler.init(Janus, {
        streamId: streamId,
        displayName: `${this.publisherId} stream`,
      }).then((handler) => {
        if (handler) {
          this.pluginHandler = handler
          return true
        } else {
          console.error('no webrtc plugin available')
          return false
        }
      }).then(() => {
        if (!this.pluginHandler) {
          return false
        }
        this.pluginHandler?.emitter.on('error', (err) => {
          console.error(err)
          this.isRoomCreated = false
        })
        return true
      }).catch((err) => {
        console.error(err)
        this.pluginHandler = null
        return false
      })

    },

    /**
     * destroy room request
     * @returns 
     */
    async destroyRoom (): Promise <void> {
      if (!this.pluginHandler) {
        console.error('no webrtc plugin availabell')
        return
      }

      const destryed = await this.pluginHandler.destroyStream()
      if (destryed) {
        this.isRoomCreated = false
        this.pluginHandler = null
      }
    },

    async createRoom (): Promise <void> {

      await this.initHandler()
      
      if (!this.pluginHandler) {
        console.error('no webrtc plugin availabele')
        return
      }

      if (!this.videoTrack) {
        console.error('local video not detected')
        return
      }

      this.isRoomCreated = await this.pluginHandler.createStream(this.videoTrack)
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
      if (this.isRoomCreated) {
        this.destroyRoom()
        return
      }

      this.createRoom()
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

  unmounted () {
    this.destroyRoom()
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
        controls: () => <div class='publisher-stream__controls'>
            <StateBar userRole={UserRole.WORKER}
              onStreamtoggle={() => this.toggleStream()}
              isStreamActive={this.isRoomCreated}
              onMuteVideo={(muted) => muted ? this.muteVideo() : this.unMuteVideo()}
              onMuteAudio={(muted) => muted ? this.muteAudio() : this.unMuteAudio()}
              onApplydevices={() => this.applyDevices()}
            />
          </div>,
        chat: () => <div class='publisher-stream publisher-state'>
          <Chat
            userId={this.publisherId}
          />
      </div>
    }}
    </RoomLayout>
  }
})
