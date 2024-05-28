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
import { States, UserState } from '@/types/store'
import { UserRole } from '@/types/global'

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
