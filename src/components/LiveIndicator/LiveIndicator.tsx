import {
  defineComponent,
  PropType,
  VNode
} from 'vue'

/** styles */
import '@/components/LiveIndicator/LiveIndicator.scss'

export default defineComponent({

  name: 'LiveIndicator',

  props: {
    live: {
      type: Boolean as PropType <boolean>,
      default: false
    }
  },

  render (): VNode {
    return <span 
        class='live-indicator__lamp' 
        user-data={this.live ? 'online' : 'offline'}
      >
    </span>
  }
})
