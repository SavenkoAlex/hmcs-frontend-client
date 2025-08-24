import {
  defineComponent,
  VNode,
} from 'vue'

/** components */
import IconButton from '@/components/general/Buttons/IconButton/IconButton'
import CameraIcon from '@/assets/images/small/tune_16dp.svg'


export default defineComponent({

  name: 'CameraController',

  emits: ['showdevicesconfiguration'],

  render (): VNode {
    return <div class='device-controller'>
      <IconButton
        onClick={() => this.$emit('showdevicesconfiguration')}
      >
        <CameraIcon/>
      </IconButton> 
    </div>
  }
})
