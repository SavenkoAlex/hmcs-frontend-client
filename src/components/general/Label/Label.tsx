import {
  defineComponent,
  VNode,
  PropType
} from 'vue'

/** types */
import { ElementScale, SidePosition } from '@/global/global'

/** helpers */
import { getSizeHash } from '@/helpers/helper'

/** styles */
import '@/components/general/Label/Label.scss'

export default defineComponent ({

  name: 'InputLabel',

  props: {
    /** label text */
    text: {
      type: String as PropType<string>,
      required: true
    },
    /** text scale */
    scale: {
      type: String as PropType <ElementScale>,
      default: ElementScale.MEDIUM
    },
    for: {
      type: String as PropType <string>,
      requred: false
    }
  },

  computed: {
    fontSize () {
      const size = getSizeHash('x-small', 'small', 'medium')[this.scale]
      return {
        'font-size': size
      }
    }
  },

  render (): VNode {
    return <div 
      class='input-label'
      style={this.fontSize}
    >
      <label for={this.for}>
        { this.text }
      </label>
    </div>
  }
})

