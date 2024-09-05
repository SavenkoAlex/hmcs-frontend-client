import {
  defineComponent,
  VNode,
  PropType
} from 'vue'

/** types */
import { NotifierStatus, ElementScale, DisplayLocation } from '@/types/global'

/** styles */
import '@/components/Notifier/Notifier.scss'

export default defineComponent({

  name: 'Notifier',

  props: {
    messageType: {
      type: String as PropType <NotifierStatus>,
      default: 'warn'
    },
    message: {
      type: String as PropType <string>,
      required: true
    },
    scale: {
      type: String as PropType <ElementScale>,
      default: ElementScale.MEDIUM
    },
    position: {
      type: String as PropType <DisplayLocation>,
      default: DisplayLocation.BOTTOM
    }
  },

  computed: {
    textClass () {
      return `notify__text_${this.scale}`   
    },

    blockClass () {
      return `notify__message_${this.position} notify__message_${this.messageType}`
    }
  },

  render (): VNode {
    return <div class={this.blockClass}>
      <p class={this.textClass}> { this.message } </p>
    </div>
  }
})
