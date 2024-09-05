import {
  defineComponent,
  VNode,
  PropType,
  ref,
  CanvasHTMLAttributes
} from 'vue'

/** Player */
import videojs from 'video.js'
import hls from 'hls.js'

// import videojs from '@videojs/http-streaming'

/** Style */
import './StreamPreview.scss'
import 'video.js/dist/video-js.css'
import Hls from 'hls.js'


export default defineComponent({
  
  name: 'StreamPreview',

  props: {

    stream: {
      type: Object as PropType<Record <string, unknown>>,
      default: {}
    }
  },

  computed: {
    options () {
      return { 
        autoplay: true,
        liveui: true,
        sources: [{
          src: 'http://192.168.0.115:8080/play/hls/sintel/index.m3u8',
          type: 'application/x-mpegURL',
        }],
      }
    }
  },

  setup () {
    const video = videojs
    const videohls = new hls({
      lowLatencyMode: true,
      enableWorker: true,
      backBufferLength: 90,
      autoStartLoad: true
    })
    const player = ref()
    const videoNode = ref<HTMLMediaElement>()
    const preview = ref<HTMLElement>()
    const canvas = ref<CanvasHTMLAttributes>()

    return {
      video,
      videohls,
      videoNode,
      preview,
      canvas,
      player
    }
  },

  mounted () {
    /*
    if (!this.videoNode) {
      return
    }
    
    this.video.use('*', function player () {
      return {
        setSource: function setSource (srcObject: any, next: (arg0: null, arg1: any) => void) {
          console.log('setSource', srcObject)
          next(null, srcObject)
        }
      }
    })
    
    this.player = this.video(this.videoNode, this.options, () => {
      this.player.play()
    })

    */
    if (Hls.isSupported() && this.videoNode) {
      this.videohls.loadSource('http://192.168.0.115:8080/play/hls/sintel/index.m3u8')
      this.videohls.attachMedia(this.videoNode)
    } else if (this.videoNode?.canPlayType('application/vnd.apple.mpegurl')){
         this.videoNode.src = 'http://vfile1.grtn.cn/2018/1542/0254/3368/154202543368.ssm/154202543368.m3u8';
      }
  },

  beforeUnmount () {
    this.player.dispose()
    if (this.videohls) {
      this.videohls.destroy()
    }
  },

  methods: {
    onPreviewFocused (event: Event) {
      console.log('focus')
    },
    onPreviewLeaveFocus (event: Event) {
      console.log('focus out')
    }
  },
  render (): VNode {
    
    return <div 
      ref={'preview'} 
      class="col-3 col-s-3 item-preview"
    >
      <video ref={'videoNode'} controls >
        Тег video не поддерживается вашим браузером.
      </video>

    </div>
  }
})
