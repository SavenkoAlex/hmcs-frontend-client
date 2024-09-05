
import {
  defineComponent,
  computed,
  ref,
  VNode
} from 'vue'

import Publisher from '@/components/Publisher/Publisher'

export default defineComponent({

  name: 'SubscriberPage',

  render (): VNode {
    return <Publisher/>
  }
})
