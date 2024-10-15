import {
  defineComponent,
  PropType,
  VNode
} from 'vue'

/** sttyles */
import '@/components/general/ImageMask/ImageMask.scss'

export default defineComponent({
  
  name: 'ImageMask',

  props: {
    image: {
      type: String as PropType <string>,
      required: true
    },
    text: {
      type: String as PropType <string>,
      required: true
    },
  },

  computed: {
    style () {
      return {
        'background-image': `url(${this.image})`,
        'background-position': 'center',
        'background-size': 'cover',
        'font-size': '5rem',
        'line-height': '80px',
        'font-weight': '900',
        'background-clip': 'text',
        'text-fill-color': 'transparent',
      }
    }
  },

  render (): VNode {
    return <div
      class='mask-image'
    >
      <h2
        style={this.style}
      >
        { this.text }
      </h2>
    </div>
  }
})
