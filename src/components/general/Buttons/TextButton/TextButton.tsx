import { defineComponent, PropType, VNode } from 'vue'

/** style */
import '@/components/general/Buttons/TextButton/TextButton.scss'

/** types */
import { ButtonMode } from '@/components/general/Buttons/TextButton/Types'

export default defineComponent({

  name: 'TextButton',

  emits: ['click'],
  
  props: {
    text: {
      type: String as PropType <string>,
      requred: true
    },
    disabled: {
      type: Boolean as PropType <boolean>,
      default: false
    },
    mode: {
      type: String as PropType <ButtonMode>,
      default: 'primary'
    }
  },

  render (): VNode {
    return <button 
      class={this.disabled ? `text-button__${this.mode}_disabled` : `text-button__${this.mode}`}
      type='button'
      onClick={(event) => this.$emit('click', event)}
      disabled={this.disabled}
    > 
      {this.text} 
    </button>
  }
})
