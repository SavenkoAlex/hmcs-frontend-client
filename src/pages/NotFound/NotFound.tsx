import {
  defineComponent,
  VNode
} from 'vue'

/** style */
import '@/pages/NotFound/NotFound.scss'

export default defineComponent({

  name: 'NotFound',

  render (): VNode {
    return <div class='not-found'> 
      <p>{ this.$t('pages.notFound.text') } </p>
    </div>
  }
})
