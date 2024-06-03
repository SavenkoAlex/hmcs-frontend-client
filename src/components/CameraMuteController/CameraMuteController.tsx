import {
  defineComponent,
  VNode,
  PropType
} from 'vue'

/** icons */
import Camera from '@/assets/images/videocam_32.svg'
import CameraOff from '@/assets/images/videocam_off_32.svg'

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
