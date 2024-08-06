import {
  defineComponent,
  Transition,
  VNode
} from 'vue'

/** Style */
import './default.scss'

export default defineComponent({

  name: 'MainLayout',

  render (): VNode {
    return <div class="main">
      <header class="main__header"> {this.$slots.header?.()}</header>
      <main class="main__content"> {this.$slots.default?.()}</main>
      <footer class="main__footer"> {this.$slots.footer?.()}</footer>
    </div>
  }
})
