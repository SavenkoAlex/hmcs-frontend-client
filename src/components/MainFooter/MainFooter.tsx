import {
  defineComponent,
  VNode
} from 'vue'

/** style */
import '@/components/MainFooter/MainFooter.scss'

export default defineComponent({

  name: 'MainFooter',

  render (): VNode {
    return <div
      class='footer'
    >
      <p> &#169; {this.$t('copyRights')} </p>
    </div>
  }
})
