import {
  defineComponent,
  VNode
} from 'vue'

/** Style */
import './default.scss'

export default defineComponent({

  name: 'MainLayout',

  render (): VNode {
    return <div class="main">
      <div class="main__header"> {this.$slots.header?.()}</div>
      <div class="main__content"> {this.$slots.default?.()}</div>
      <div class="main__footer"> {this.$slots.footer?.()}</div>
    </div>
  }
})
