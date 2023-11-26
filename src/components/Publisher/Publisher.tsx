
import {
  defineComponent,
  VNode,
  ref,
  inject
} from 'vue'

// janus
import Janus from 'janus-gateway'
import { PublisherStreamHandler } from '@/services/webrtc/webrtcPublisher'

// Style
import './Publisher.scss'

export default defineComponent({

  name: 'Publisher',

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

    const constraints = {
      audio: false,
      video: true
    }

    const pluginHandler = ref <PublisherStreamHandler> ()
    const videoTrack = ref <MediaStreamTrack | null>()
    const audioTrack = ref <MediaStreamTrack | null> ()
    const crypto = inject<Crypto>('crypto')

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
      crypto
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
    destroyRoom (): Promise <true | false> | undefined {
      if (!this.pluginHandler) {
        console.error('no webrtc plugin availabell')
        return
      }

      return this.pluginHandler.destroyStream()
    },


    

    async startStream (): Promise <void> {
      if (!this.pluginHandler) {
        console.error('no webrtc plugin availabele')
        return
      }

      if (!this.videoTrack) {
        console.error('local video not detected')
        return
      }

      this.pluginHandler.createStream(this.videoTrack)
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
    return <div class="container">
      <div class="publisher">
        <video srcObject={this.publisherStream} ref={'publisherNode'} autoplay> Video is not supportd </video>
      </div>
      <div class='client'>
        <video srcObject={this.clientStream} ref={'clientNode'} autoplay> Video is not supportd </video>
      </div>
      <div class="controls col-12">
        <button
          class='col-3'
          onClick={() => this.startStream()}
          disabled={!this.isHandlerAvailable}
        > 
          Create Room 
        </button>
        
        <button
          onClick={() => console.log(this.publisherId)}
        >
          Get ID
        </button>
      </div>
    </div>
  }
})
