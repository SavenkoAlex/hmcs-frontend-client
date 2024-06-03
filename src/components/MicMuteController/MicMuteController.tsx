import {
  defineComponent,
  VNode,
  PropType
} from 'vue'

/** icons */
import Mic from '@/assets/images/mic_32.svg'
import MicOff from '@/assets/images/mic_off_32.svg'

/** components */
import IconButton from '@/components/general/Buttons/IconButton/IconButton'

export default defineComponent ({

  name: 'MicMuteController',

  emits: ['update:modelValue'],

  props: {

    /**muted flag */
    modelValue: {
      type: Boolean as PropType <boolean>,
      default: false
    }
  },

  render (): VNode {
    return <div class='mic-controller'>
      <IconButton
        onClick={ () => this.$emit('update:modelValue', !this.modelValue) }
      >
        { this.modelValue ? <MicOff/> : <Mic/> }
      </IconButton>
    </div>
  }
})
