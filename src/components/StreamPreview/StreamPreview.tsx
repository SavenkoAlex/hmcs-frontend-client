import {
  defineComponent,
  VNode,
  PropType,
  ref,
  CanvasHTMLAttributes
} from 'vue'

import videojs from 'video.js'

/** Style */
import './StreamPreview.scss'
/** Player */

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
      return { title: 'Stream', source: 'https://cdn.flowplayer.com/a30bd6bc-f98b-47bc-abf5-97633d4faea0/v-de3f6ca7-2db3-4689-8160-0f574a5996ad.mp4' }
    }
  },

  setup () {
    const player = ref()
    const videoNode = ref<HTMLElement>()
    const preview = ref<HTMLElement>()
    const canvas = ref<CanvasHTMLAttributes>()

    return {
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
    
    this.player = videojs(this.videoNode, this.options, () => {
      this.player.log('onPlayerReady', this);
    });
  },

  beforeUnmount () {
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
      <video ref={'videoNode'}  src={this.options.source} controls>
        Тег video не поддерживается вашим браузером.
      </video>
    </div>
  }
})
