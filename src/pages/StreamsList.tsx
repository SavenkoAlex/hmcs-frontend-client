import { 
  defineComponent,
  VNode,
  ref 
} from 'vue'

/** API */
import streamApi, { StreamPublisher } from '../api/stream'

/** Components */
import ViewerItem from '@/components/StreamPreview/StreamPreview'

/** Style */
import './StreamList.scss'

export default defineComponent({
  
  name: 'StreamList',

  components: {
    ViewerItem
  },

  setup () {
    const title = 'Stream'
    const streams = ref<{publisher: string, stream: StreamPublisher}[]>()

    return {
      title,
      streams
    }
  },

  mounted () {
    /*
    streamApi.getStreams().then((res) => {
      if (!res) {
        return
      }
      this.streams = Object.entries(res.live).map((item) => {
        return {
          publisher: item[0],
          stream: item[1]
        }
      })
    })
    */
  },

  render (): VNode {
    return <div class={'stream-list'}> 
      <h1> { this.title }  </h1>

      <div class="container row">
        {
          [
            <ViewerItem/>,
            <ViewerItem/>,
            <ViewerItem/>,
            <ViewerItem/>
          ]
        }
      </div>
    </div>
  }
})
