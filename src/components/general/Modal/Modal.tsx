import { zIndex } from '@/types/global'

import {
  defineComponent,
  VNode,
  PropType,
  Transition
} from 'vue'

/** style */
import '@/components/general/Modal/Modal.scss'
import { Dialog } from 'primevue'

export default defineComponent({

  name: 'Modal',

  emits: ['close'],

  props: {

    /** is underneath content blocked flag */
    maximizable: {
      type: Boolean as PropType <boolean>,
      default: true
    },

    /** modal visibility */
    isVisible: {
      type: Boolean as PropType <boolean>,
      default: false
    }
  },


  render (): VNode {
    return <Dialog
        visible={this.isVisible}
        maximizable={this.maximizable}
        //@ts-expect-error
        onUpdate:visible={() => this.$emit('close')}
        hide={() => console.log('close')}
        closeOnEscape
        breakpoints={{ '767px': '90%' }}
      >
      {{
        header: () => this.$slots.header?.(),
        default: () => this.$slots.default?.(),
        footer: () => this.$slots.footer?.()
      }}
    </Dialog>
  }
})

