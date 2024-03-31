import { 
  defineComponent,
  VNode,
  ref 
} from 'vue'

/** API */
import streamApi, { StreamPublisher } from '@/api/stream'

/** Components */
import Streams from '@/components/Streams/Streams'

/** Style */
import '@/pages/Streams/StreamList.scss'

export default defineComponent({
  
  name: 'StreamList',

  components: {
    Streams
  },

  setup () {
    const title = 'Stream'

    return {
      title,
    }
  },

  render (): VNode {
    return <div class={'stream-list'}> 
      <Streams/>
    </div>
  }
})
