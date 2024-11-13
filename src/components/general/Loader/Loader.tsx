import {
  defineComponent,
  VNode,
  PropType
} from 'vue'

/** style */
import './Loader.scss'

import { Data } from '@/components/general/Loader/types'

export default defineComponent({

  name: 'Loader',

  props: {
    isVisible: {
      type: Boolean as PropType<boolean>,
      default: false
    },

    delay: {
      type: Number as PropType <number>,
      default: 500
    }
  },

  computed: {
    style () {
      if (this.isVisible || !this.isDelayPassed) {
        return { display: 'block' }
      } 
      return { display: 'none' }
    }
  },

  watch: {
    isVisible: {
      handler: function (newValue: boolean) {
        if (newValue) {
          this.isDelayPassed = false
          this.timeout = setTimeout(() => {
            this.isDelayPassed = true
          }, this.delay)
        }
      },
      immediate: true
    }
  },
  data (): Data {
    return {
      isDelayPassed: false,
      timeout: null
    }
  },

  unmounted() {
    if (this.timeout !== null) {
      clearTimeout(this.timeout)
    }
  },

  render(): VNode {
    return <div class='loader' style={this.style}>
      <div class='loader__spinner'></div>
    </div>
  }
})
