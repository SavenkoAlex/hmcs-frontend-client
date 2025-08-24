import {
  defineComponent,
  Transition,
  VNode
} from 'vue'

/** Style */
import '@/layouts/default.scss'
import { Toast } from 'primevue'

export default defineComponent({

  name: 'MainLayout',

  render (): VNode {
    return <div class="main">
      <header class="main__header"> {this.$slots.header?.()}</header>
      <main class="main__content"> {this.$slots.default?.()}</main>
      <footer class="main__footer"> {this.$slots.footer?.()}</footer>
      <Toast
        position='top-center'
        breakpoints={{ '767px': { width: '90%' } }}
        pt={{
         summary: {
           class: 'toast-summary'
         } 
        }}
      />
    </div>
  }
})
