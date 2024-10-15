import {
  defineComponent,
  PropType,
  VNode
} from 'vue'


/** styles */
import '@/components/general/Link/Link.scss'

/** types */
import { ElementScale } from '@/types/global'

export default defineComponent({

  name: 'Link',

  props: {
    size: {
      type: String as PropType  <ElementScale>,
      default: ElementScale.MEDIUM
    }
    
  },

  render(): VNode {
    return <div
      class={`link_${this.size}`}
    >
      {this.$slots.default?.()}
    </div>
  }
})
