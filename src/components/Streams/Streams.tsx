import {
  defineComponent,
  VNode,
  ref,
  inject,
  Transition
} from 'vue'

/** styles */
import '@/components/Streams/Streams.scss'

/** types */
import { Room, supKey } from '@/types/global'
import { StreamsData } from '@/components/Streams/types'

//SVG
import { RouterLink } from 'vue-router'

/** api */
import userApi from '@/api/user'

/** components */
import StreamItem from '@/components/Streams/StreamItem'

/** webrtcHandler */
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'

export default defineComponent({

  name: 'Streams',

  components: {
    StreamItem
  },

  watch: {
    pluginHandler: {
      handler: function () {
        this.getRooms().then(result => {
          for (const room of result) {
            this.rooms[room.room] = room
          }
        })
      }
    }
  },

  setup () {
    const rooms = ref <Record <number, Room>>({})
    const pluginHandler = inject<SubscriberStreamHandler | null> (supKey, null)

    return {
      rooms,
      pluginHandler,
    }

  },

  data(): StreamsData {
    return {
      users: []
    }
  },

  methods: {
    async getRooms (): Promise <Room[]> {
      if (!this.pluginHandler) {
        return []
      }

      const rooms = await this.pluginHandler.getPublishers()
      return rooms || []

    }
  },


  async mounted () {

    const users  = await userApi.getUsers()
    if (users && users.length > 0) {
      this.users = users
    }
  },

  render (): VNode {
    return <div class='streamer-list'>
      {
        this.users.map(user => 
          <div class='streamer-list__item'>
            <StreamItem 
              stream={user}
              online={ !!(user?.streamId && user.streamId in this.rooms) }
            />
          </div>
        )
      }
    </div>
  }
})
