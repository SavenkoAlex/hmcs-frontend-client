import {
  defineComponent,
  VNode,
  PropType
} from 'vue'

/** icons */
import Camera from '@/assets/images/small/videocam_16dp.svg'
import CameraOff from '@/assets/images/small/videocam_off_16dp.svg'

/** components  */
import IconButton from '@/components/general/Buttons/IconButton/IconButton'

export default defineComponent({

  name: 'CameraMuteController',

  emits: ['update:modelValue'],

  props: {
    modelValue: {
      type: Boolean as PropType <boolean>,
      default: false
    }
  },

  render (): VNode {
    return <div class='camera-controller'>
      <IconButton
        onClick={ () => this.$emit('update:modelValue', !this.modelValue) }
      >
        { this.modelValue ? <CameraOff/> : <Camera/> }
      </IconButton>
    </div>
  }
})
