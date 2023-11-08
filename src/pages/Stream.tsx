
import {
  defineComponent,
  computed,
  ref,
  VNode
} from 'vue'

import Subscriber from '@/components/Subscriber/Subscriber'

export default defineComponent({

  name: 'SubscriberPage',

  render (): VNode {
    return <Subscriber/>
  }
})
