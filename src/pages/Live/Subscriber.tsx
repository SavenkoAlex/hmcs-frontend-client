import {
  defineComponent,
  VNode
} from 'vue'

/** vuex */
import { mapGetters } from 'vuex'

/** components */
import Publisher from '@/components/Publisher/Publisher'
import Subscriber from '@/components/Subscriber/Subscriber'

/** types */
import { States, UserState } from '@/global/store'
import { UserRole } from '@/global/global'

export default defineComponent ({

  name: 'PublisherPage',

  composnents: {
    Publisher,
    Subscriber
  },

  computed: {
    ...mapGetters(States.USER, ['getUser'])
  },

  render (): VNode {
    return <Subscriber/>
  }
})
