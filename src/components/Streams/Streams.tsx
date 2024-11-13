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
import { supKey } from '@/types/global'
import { StreamsData } from '@/components/Streams/types'


/** api */
import userApi from '@/api/user'

/** components */
import StreamItem from '@/components/Streams/StreamItem'
import BaseLoader from '@/components/general/Loader/Loader'

/** webrtcHandler */
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'
import Loader from '@/components/general/Loader/Loader'

export default defineComponent({

  name: 'Streams',

  components: {
    StreamItem
  },

  watch: {
    pluginHandler: {
      handler: function (newValue) {
        if (!newValue) {
          return
        }
        this.getOnlineUsers()
      }, 
      immediate: true
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
      userStreams: [],
      isLoading: false
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
      const onlineRooms = Object.keys(this.rooms).map(item => Number.parseInt(item, 10))
      if (!onlineRooms?.length) {
        this.users = []
        return
      }

      const users  = await userApi.getUsersByStream(onlineRooms)
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
    },

    /** get online users */
    async getOnlineUsers (): Promise <void> {
      this.isLoading = true
      await this.getRooms()
      await this.getUsers()
      this.markUsersOnline()
      this.isLoading = false
    }
  },


  render (): VNode {
    return <div class='streamer-list'>
      <Loader
        isVisible={this.isLoading}
      />
      {
        this.userStreams.length 
          ? this.userStreams.map(({ user, isOnline }) => 
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
