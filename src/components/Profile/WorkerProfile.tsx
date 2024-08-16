import {
  defineComponent,
  PropType,
  VNode
} from 'vue'

export default defineComponent({

  name: 'WorkerProfile',

  props: {
    userId: {
      type: String as PropType <string | null>,
      default: null
    }
  },

  render(): VNode {
    return <div class='worker-profile'>
      safdasfdsdf 
    </div>
  }
})
