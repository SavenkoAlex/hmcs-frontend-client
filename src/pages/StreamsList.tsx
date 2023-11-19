import { 
  defineComponent,
  VNode,
  ref 
} from 'vue'

/** API */
import streamApi, { StreamPublisher } from '../api/stream'

/** Components */
import Strems from '@/components/Streams/Streams'

/** Style */
import './StreamList.scss'

export default defineComponent({
  
  name: 'StreamList',

  components: {
    Strems
  },

  setup () {
    const title = 'Stream'

    return {
      title,
    }
  },

  render (): VNode {
    return <div class={'stream-list'}> 
      <h1> { this.title }  </h1>
      <Strems/>
    </div>
  }
})
