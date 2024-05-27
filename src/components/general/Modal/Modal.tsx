import { zIndex } from '@/global/global'

import {
  defineComponent,
  VNode,
  PropType,
  Transition
} from 'vue'

/** style */
import '@/components/general/Modal/Modal.scss'
import { isVisible } from 'element-plus/es/utils'

export default defineComponent({

  name: 'Modal',

  emits: ['close'],

  props: {
    /** modal z-index offset  */
    indexOffset: {
      type: Number as PropType <number>,
      default: 0
    },
    /** is underneath content blocked flag */
    blockBackground: {
      type: Boolean as PropType <boolean>,
      default: true
    },
    /** function to call on close */
    resolve: {
      type: Function as PropType <typeof Promise.resolve>,
      default: () => Promise.resolve({
        close: true
      })
    },
    /** modal visibility */
    isVisible: {
      type: Boolean as PropType <boolean>,
      default: false
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
    return <Transition name='modal'>
      {
        this.isVisible && <div class='modal'>
          <div class="modal__background"></div>

          <div class='modal__content'>
            <div class="modal__header">
              <div class='modal__title'>
                {this.$slots.header?.()}
              </div>
              <div class='modal__close' onClick={() => this.$emit('close')}> 
                <span> &#10005; </span> 
              </div>
            </div>
            <div class="modal__body"> {this.$slots.default?.()} </div>
            <div class='modal__footer'> {this.$slots.footer?.() }</div>
          </div>
        </div>
      }
    </Transition>
  }
})

