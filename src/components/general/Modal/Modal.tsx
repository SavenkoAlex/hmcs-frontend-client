import { zIndex } from '@/global/global'

import {
  defineComponent,
  VNode,
  PropType,
  Transition
} from 'vue'

/** style */
import '@/components/general/Modal/Modal.scss'

export default defineComponent({

  name: 'Modal',

  props: {
    indexOffset: {
      type: Number as PropType <number>,
      default: 0
    },
    blockBackground: {
      type: Boolean as PropType <boolean>,
      default: true
    },
    resolve: {
      type: Function as PropType <typeof Promise.resolve>,
      default: () => Promise.resolve({
        close: true
      })
    }
  },

  computed: {
    modalStyle () {
      return {
        zIndex: this.indexOffset + zIndex
      }
    },
    backgroundStyle () {
      return {
        zIndex: this.indexOffset + zIndex - 1
      }
    }
  },

  render (): VNode {
    return <Transition>
      <div>

      <div class="modal__background"></div>
      <div class='modal__content'>
        <div class="modal__header">
          
          <div class='modal__title'>
            {this.$slots.header?.()}
          </div>
          <div class='modal__close' onClick={() => this.resolve()}> 
            <span> &#10005; </span> 
          </div>
        </div>
        <div class="modal__body"> {this.$slots.default?.()} </div>
        <div class='modal__footer'> {this.$slots.footer?.() }</div>
      </div>
      </div>
    </Transition>
  }
})

