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
import { Room, supKey, User } from '@/types/global'
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
        this.getRooms()
        this.markUsersOnline()
      }
    },
  },

  setup () {
    const pluginHandler = inject<SubscriberStreamHandler | null> (supKey, null)
    return {
      pluginHandler,
    }
  },

  data(): StreamsData {
    return {
      users: [],
      rooms: {},
      userStreams: []
    }
  },

  methods: {
    async getRooms (): Promise <void> {
      if (!this.pluginHandler) {
        this.rooms = {}
        return
      }

      const rooms = await this.pluginHandler.getPublishers()
      
      if (!rooms || !rooms.length) {
        this.rooms =  {}
        return
      }

      for (const room of rooms) {
        if (room.room) {
          this.rooms[room.room] = room
        }
      }
    },

    async getUsers (): Promise <void> {
      const users  = await userApi.getUsers()
      if (users && users.length > 0) {
        this.users = users
        return
      }

      this.users = []
    },

    markUsersOnline () {
      const extendedUsers = this.users.map(item => ({
        user: item,
        isOnline: (item.streamId && item.streamId in this.rooms) || false
      }))
      this.userStreams = extendedUsers
    }
  },

  async mounted () {
    await this.getRooms()
    await this.getUsers()
    this.markUsersOnline()
  },


  render (): VNode {
    return <div class='streamer-list'>
      {
        this.userStreams.length ?
          this.userStreams.map(({ user, isOnline }) => 
            <div class='streamer-list__item'>
              <StreamItem 
                stream={ user }
                online={ isOnline }
              />
            </div>
          )
        : <div class='streamer-list__empty'>
          <p> { this.$t('components.streams.streamsListEmpty') } </p>
        </div>
      }
    </div>
  }
})
