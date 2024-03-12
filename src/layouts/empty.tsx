import { defineComponent, VNode } from 'vue'

export default defineComponent({

  name: 'EmptyLayout',

  render (): VNode {
    return <div>
      {
        this.$slots.default?.()
      }
    </div>
  }
})
