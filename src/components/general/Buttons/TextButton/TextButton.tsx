import { defineComponent, PropType, VNode } from 'vue'

/** style */
import '@/components/general/Buttons/TextButton/TextButton.scss'

export default defineComponent({

  name: 'TextButton',

  emits: ['click'],
  
  props: {
    text: {
      type: String as PropType <string>,
      requred: true
    }
  },

  render (): VNode {
    return <button 
      class='text-button'
      type='button'
      onClick={(event) => this.$emit('click', event)}
    > 
      {this.text} 
    </button>
  }
})
