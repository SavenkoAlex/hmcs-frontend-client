
import {
  defineComponent,
  VNode,
  ref,
  inject,
  Transition
} from 'vue'

// janus
import Janus from 'janus-gateway'
import { PublisherStreamHandler } from '@/services/webrtc/webrtcPublisher'

// style
import './Publisher.scss'

/** components */
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import Chat from '@/components/Chat/Chat'

export default defineComponent({

  name: 'Publisher',

  components: {
    TextButton,
    Chat
  },

  computed: {
    isHandlerAvailable (): boolean {
      return !!this.pluginHandler
    }
  },

  setup () {
    const publisherNode = ref <HTMLMediaElement> ()
    const clientNode = ref <HTMLVideoElement> ()

    const publisherStream = ref <MediaStream> ()
    const clientStream = ref <MediaStream> ()

    const publisherId = ref<number>()

    const isPictureInPictureEnabled = ref <boolean> (false)

    const constraints = {
      audio: false,
      video: true
    }

    const pluginHandler = ref <PublisherStreamHandler> ()
    const videoTrack = ref <MediaStreamTrack | null>()
    const audioTrack = ref <MediaStreamTrack | null> ()
    const crypto = inject<Crypto>('crypto')
    const tarotPoster = ref <HTMLImageElement> ()

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
      tarotPoster,
      isPictureInPictureEnabled,
      isRoomCreated

    }
  },

  watch: {
    publisherStream (newValue : MediaStream | null) {
      if (!newValue) {
        this.videoTrack = null
        this.audioTrack = null
        return
      }

      this.videoTrack = newValue.getVideoTracks()[0]
      this.audioTrack = newValue.getAudioTracks()[0]
    },
  },

  methods: {

    getUserMedia (): Promise <MediaStream | null> {
      return navigator.mediaDevices.getUserMedia(this.constraints)
        .then(stream => {
          return stream || null
        })
        .catch (err => {
          console.error(err)
          return null
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
      }
    },


    

    async createRoom (): Promise <void> {
      if (!this.pluginHandler) {
        console.error('no webrtc plugin availabele')
        return
      }

      if (!this.videoTrack) {
        console.error('local video not detected')
        return
      }

      this.isRoomCreated= await this.pluginHandler.createStream(this.videoTrack)
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

    onClientCanPlay (event: Event) {
      const target = event.target as HTMLVideoElement
      target.onenterpictureinpicture = (event: Event) => {
        this.isPictureInPictureEnabled = true
      }
      target.onleavepictureinpicture = () => {
        this.isPictureInPictureEnabled = false
      }

      this.clientNode?.requestPictureInPicture().catch((err) => {
        console.error(err)
        this.isPictureInPictureEnabled = false
      })
    }
  },

  async mounted () {

    const publisherId  = this.getNewPublisherId()

    if (!publisherId) {
     console.error('Can not generate id')
     return
    }
    this.publisherId = publisherId
   
    PublisherStreamHandler.init(Janus, {
      streamId: String(this.publisherId),
      displayName: `${this.publisherId} stream`,
      mountId: this.publisherId
    }).then((handler) => {
      if (handler) {
        this.pluginHandler = handler
      } else {
        throw new Error('no webrtc plugin available')
      }
    })

    this.getUserMedia().then(result => {
      if (result) {
        this.publisherStream = result
      }
    })


  },

  unmounted () {
    this.destroyRoom()
  },

  render (): VNode {
    return <div class="publisher-stream">
      <div class="publisher-stream__publisher-video">
        <Transition>
          <video 
            srcObject={this.publisherStream} 
            ref={'publisherNode'} 
            autoplay
            playsinline
          > 
            Video is not supportd 
          </video>
        </Transition>
      </div>
      <div class={this.isPictureInPictureEnabled 
        ? 'publisher-stream__client-video' 
        : 'publisher-stream__client-video_hidden'}>
        <Transition>
          <video 
            srcObject={this.publisherStream} 
            ref={'clientNode'} 
            autoplay
            controls
          > 
            Video is not supportd
          </video>
        </Transition>
      </div>
      <div class='publisher-stream__controls'>
        <div class='publisher-stream__button'>
          <TextButton
            onClick={() => { this.isRoomCreated ? this.destroyRoom() : this.createRoom()}}
            disabled={!this.isHandlerAvailable}
            mode={this.isRoomCreated ? 'fourth' : 'tertiary'}
            text={this.isRoomCreated ? this.$t('pages.publisher.destroyRoom') : this.$t('pages.publisher.createRoom')} 
          /> 
        </div>

        <div class='publisher-stream__button'>
        <TextButton
          onClick={() => console.log(this.publisherId)}
          text={'Get ID'}
        />
        </div>
      </div>
      <div class='publisher-stream__chat'>
        <Chat
          userId={this.publisherId}
        />
      </div>
    </div>
  }
})
