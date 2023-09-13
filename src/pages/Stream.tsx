
import {
  defineComponent,
  computed,
  ref,
  VNode
} from 'vue'

// import videojs from 'video.js'
import streamApi from '@/api/stream'
// import * as fetchFlv from 'videojs-fetch-flv'
// import 'video.js/dist/video-js.css'

export default defineComponent({

  name: 'Subscriber',
  /*
  setup () {
    const key = ref<string | null>(null)

    const option = computed(() => ({
      autoplay: false,
      controls: true,
      sources: [{
        src: `${key.value}/index.m3u8`,
        type: 'application/x-mpegURLvideo'
      }]
    }))

    const video = videojs
    const videoNode = ref <Element>()
    const player = ref <any>()

    return {
      video,
      option,
      key,
      videoNode,
      player
    }
  },

  methods: {
    getStream () {
      console.log('!!!', this.$route.fullPath)
    },

    async getPublisher () {
      try {
        const publiisher = await streamApi.getPublisher(this.$route.fullPath)
        console.log(publiisher)
        return publiisher
      } catch (err) {
        console.error(err)
      }
    },

    async getPublisherStream () {
      try {
        const stream = await streamApi.getPublisherStream(this.$route.fullPath)
        return stream
      } catch (err) {
        console.error(err)
      }
    }
  },

  async mounted () {
    if (!this.$route.fullPath) {
      console.warn('no route path')
      return
    }
    this.key = this.$route.fullPath
    await this.getPublisher()
    // const stream = await this.getPublisherStream()
    if (!this.videoNode) {
      console.log('video node', this.videoNode)
      return
    }
    this.video.use('*', function player () {
      return {
        setSource: function setSource (srcObject: any, next: (arg0: null, arg1: any) => void) {
          // console.log('setSource', srcObject)
          next(null, srcObject)
        }
      }
    })
    this.player = this.video(this.videoNode, this.option, function onPlayerReady (this: any) {
      console.log('onPlayerReady', this)
    })
  },

  beforeUnmount () {
    this.player.dispose()
  }
  */

  render (): VNode {
    return <div class="stream">
      <h2> Subscriber </h2>
        <div
          class="palyer-wrapper"
        >
            <video ref='videoNode' width={600} height={300} class="video-js" controls>
              Тег video не поддерживается вашим браузером.
            </video>
        

        </div>
        </div>

      } 
})
