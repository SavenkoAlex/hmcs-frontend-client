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
      if (this.isVisible || this.timeout) {
        return { display: 'block' }
      } 
      return { display: 'none' }
    }
  },

  watch: {
    isVisible: {
      handler: function (newValue: boolean) {
        if (!newValue) {
          return
        }

        if (this.timeout) {
          clearTimeout(this.timeout)
        }

        this.timeout = setTimeout(() => {
          if (this.timeout) {
            this.timeout = null
          }
        }, this.delay)
      },
      immediate: true
    }
  },
  data (): Data {
    return {
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
