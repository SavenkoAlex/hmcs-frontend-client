import {
  defineComponent,
  VNode,
  PropType
} from 'vue'

/** style */
import './Loader.scss'

export default defineComponent({

  name: 'Loader',

  props: {
    isVisible: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },

  computed: {
    style () {
      return this.isVisible ? { display: 'block' } : { display: 'none' }
    }
  },

  render(): VNode {
    return <div class='loader' style={this.style}>
      <div class='loader__spinner'></div>
    </div>
  }
})
