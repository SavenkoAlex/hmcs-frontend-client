import {
  defineComponent,
  VNode,
  PropType
} from 'vue'

/** icons */
import PlayIcon from '@/assets/images/play_32.svg'
import StopIcon from '@/assets/images/stop_32.svg'

/** components  */
import IconButton from '@/components/general/Buttons/IconButton/IconButton'

/** styles */
import '@/components/StreamController/StreamController.scss'

export default defineComponent({

  name: 'StreamControoller',

  emits: ['update:modelValue'],

  props: {
    /** is stream active */
    modelValue: {
      type: Boolean as PropType <boolean>,
      default: false
    },
  },

  render (): VNode {
    return <div class='stream-controller'>
      <IconButton 
        mode={this.modelValue ? 'fourth' : 'active'}
        onClick={() => this.$emit('update:modelValue', !this.modelValue)}
      >
        { this.modelValue ?  <StopIcon/> : <PlayIcon/>  }
      </IconButton>
    </div>
  }
})
