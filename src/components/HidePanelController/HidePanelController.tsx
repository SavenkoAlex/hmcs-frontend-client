import {
  defineComponent,
  PropType,
  VNode
} from 'vue'

/** styles */
import './HidePanelController.scss'

/** icon */
import HideIcon from '@/assets/images/small/double_arrow_16dp.svg'

/** components */
import IconButton from '@/components/general/Buttons/IconButton/IconButton'

export default defineComponent({

  name: 'HidePanelController',  

  emits: ['collapsepanel'],

  computed: {
    elClass () {
      return this.isHidden ? 'hide-panel-controller_hidden' : 'hide-panel-controller'
    }
  },

  data () {
    return {
      isHidden: false
    }
  },

  render (): VNode {
    return <div class={this.elClass}>
      <IconButton 
        mode={'primary'}
        onClick={() => {
          this.$emit('collapsepanel', !this.isHidden)
          this.isHidden = !this.isHidden
        }}
      >
        <HideIcon/>
      </IconButton>
    </div>
  } 
})
