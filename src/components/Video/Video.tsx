import {
  defineComponent,
  PropType,
  ref,
  VNode
} from 'vue'

import './Video.scss'

export default defineComponent({

  name: 'BaseVideo',

  props: {
    srcObject: {
      type: Object as PropType <MediaStream | undefined>,
      required: true
    },
    ref: {
      type: [String] as PropType <string>,
      default: ''
    },

    autoplay: {
      type: Boolean as PropType <boolean>,
      default: true
    },

    playsinline: {
      type: Boolean as PropType <boolean>,
      default: true
    },

    notSupprtedText: {
      type: String as PropType <string>,
      default: 'Video is not supported'
    }
  },
  render (): VNode {
    return  <div class='base-video'>
      <video 
        srcObject={this.srcObject} 
        ref={this.ref} 
        autoplay
        playsinline
      > 
        { this.notSupprtedText }
      </video>
    </div>
  } 
})
