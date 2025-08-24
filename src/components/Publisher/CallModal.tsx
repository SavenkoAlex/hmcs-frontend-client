import {
  defineComponent,
  PropType,
  VNode,
  h
} from 'vue'

import { Dialog, Button } from 'primevue'

/** style */
import './CallModal.scss'


/** icons */
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiPhone, mdiPhoneHangup  } from '@mdi/js';

export default defineComponent({
  
  name: 'CallModal',

  props: {

    message: {
      type: Object as PropType <{ from: string, date: string }>,
      required: false
    },

    isVisible: {
      type: Boolean as PropType <boolean>,
      default: false
    }
  },

  computed : {
    isModalVisible(): boolean {
      return this.isVisible && !!this.message
    }
  },

  components: {
    Dialog,
    Button
  },

  emits: ['decline', 'accept', 'close'],

  /**
   * render
   * @return {VNode}
   */

  data () {
    return {
      phoneIconPath: mdiPhone,
      hangupIconPath: mdiPhoneHangup
    }
  },
  render (): VNode {
    const body = <div class='call-content'>
      <p> { this.$t('pages.publisher.call.requestFrom') } {this.message?.from || '' } </p>
    </div>

    const footer = <div class='call-footer'>
      <Button
        size='large'
        rounded 
        severity="success"
        raised
        aria-label='Accept'
        onClick={() => this.$emit('accept')}
      > 
      {{
        icon: () => h(SvgIcon, { type: 'mdi', path: this.phoneIconPath })
      }}
      </Button>
      <Button
        size='large'
        rounded 
        severity="danger"
        raised
        aria-label='Accept'
        onClick={() => this.$emit('decline')}
      >
      {{
        icon: () => h(SvgIcon, { type: 'mdi', path: this.hangupIconPath })
      }}
      </Button>
    </div>

    return  <Dialog
        visible={this.isModalVisible}
        //@ts-expect-error
        onUpdate:visible={() => this.$emit('close')}
        hide={() => this.$emit('close')}
        closeOnEscape
        breakpoints={{ '767px': '75%' }}
      >
      {{
        header: () => this.$t('pages.publisher.call.title') ,
        default: () => body,
        footer: () => footer
      }}
    </Dialog>
  }
})
