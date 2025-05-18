import {
  defineComponent,
  VNode,
  inject,
} from 'vue'

/** styles */
import '@/components/Streams/Streams.scss'

/** types */
import { subscriberHandlerKey } from '@/types/global'
import { StreamsData } from '@/components/Streams/types'

/** api */
import userApi from '@/api/user'

/** components */
import StreamItem from '@/components/Streams/StreamItem'

/** webrtcHandler */
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'
import Loader from '@/components/general/Loader/Loader'

/** toast */
import { useToast } from 'vue-toastification'

export default defineComponent({

  name: 'Streams',

  components: {
    StreamItem
  },

  watch: {
    'pluginHandler.handlerInstance': {
      handler: function (newValue) {
        if (!newValue || !newValue?.id) {
          return
        }
        this.getOnlineUsers()
      }, 
      immediate: true
    },
  },

  setup () {
    const pluginHandler = inject<SubscriberStreamHandler | null> (subscriberHandlerKey, null)
    const toast = useToast()

    return {
      pluginHandler,
      toast
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

      const rooms = await this.pluginHandler?.getStreams()
      
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
      try {
        this.isLoading = true
        await this.getRooms()
        await this.getUsers()
        this.markUsersOnline()
      } catch (err) {
        this.isLoading = false
        this.toast.error(this.$t('services.webrtc.errors.canNotConnectStream'))
      } finally {
        this.isLoading = false
      }
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
