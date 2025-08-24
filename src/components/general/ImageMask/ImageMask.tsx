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
      }
    }
  },

  render (): VNode {
    return <div
      class='mask-image'
    >
      <h2 style={this.style}>
        { this.text }
      </h2>
    </div>
  }
})
