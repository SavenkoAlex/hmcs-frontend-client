import {
  defineComponent,
  VNode,
  PropType,
  ref,
  CanvasHTMLAttributes
} from 'vue'

/** Player */
import videojs from 'video.js'

/** Style */
import './StreamPreview.scss'
import 'video.js/dist/video-js.css'


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
        title: 'Stream', 
        liveui: true,
        sources: [{
           src: 'http://192.168.0.110:8887/live/qwerty1/index.m3u8',
           type:'application/x-mpegURL'
        }]
      }
    }
  },

  setup () {
    const video = videojs
    const player = ref()
    const videoNode = ref<HTMLElement>()
    const preview = ref<HTMLElement>()
    const canvas = ref<CanvasHTMLAttributes>()

    return {
      video,
      videoNode,
      preview,
      canvas,
      player
    }
  },

  mounted () {
    if (!this.videoNode) {
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
    this.player = this.video(this.videoNode, this.options, () => {
      this.player.log('onPlayerReady', this);
    });
  },

  beforeUnmount () {
    this.player.dispose()
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
      onFocusin={$event => this.onPreviewFocused($event)}
      onFocusout={$event => this.onPreviewLeaveFocus($event)}
    >
      <video ref={'videoNode'} controls class='vide-js'>
        Тег video не поддерживается вашим браузером.
      </video>
    </div>
  }
})
