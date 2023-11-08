import {
  defineComponent,
  VNode
} from 'vue'

import Publisher from '@/components/Publisher/Publisher'

export default defineComponent ({

  name: 'PublisherPage',

  render (): VNode {
    return <Publisher/>
  }
})
