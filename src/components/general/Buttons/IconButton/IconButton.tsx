import { defineComponent, PropType, Transition, VNode } from 'vue'

/** style */
import '@/components/general/Buttons/IconButton/IconButton.scss'

/** types */
import { ButtonMode } from '@/components/general/Buttons/TextButton/Types'

export default defineComponent({

  name: 'IconButton',

  emits: ['click'],
  
  props: {
    text: {
      type: String as PropType <string | null>,
      default: null
    },
    disabled: {
      type: Boolean as PropType <boolean>,
      default: false
    },
    mode: {
      type: String as PropType <ButtonMode>,
      default: 'primary'
    },
    reverseflow: {
      type: Boolean as PropType <boolean>,
      default: false
    }
  },

  render (): VNode {
    return <Transition><button 
      class={this.disabled 
        ? `icon-button_disabled` 
        : `icon-button__${this.mode}`
      }
      type='button'
      onClick={(event) => this.$emit('click', event)}
      disabled={this.disabled}
    > 
      {this.reverseflow 
        ? [this.$slots.default?.(), this.text]
        : [this.text, this.$slots.default?.()]
      } 
    </button>
    </Transition>
  }
})
