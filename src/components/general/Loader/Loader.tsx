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
    return this.isVisible 
    ? <div class='loader'>
      <div class='loader__spinner'></div>
    </div>
    : <> </>
  }
})
