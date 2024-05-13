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
    return <div class='live-indicator' style={{
      'background-color': this.live ? 'green' : 'red'
      }}>
        <span class={this.live ? 'live-indicator_online' : 'live-indicator_offline'}></span>
    </div>
  }
})
