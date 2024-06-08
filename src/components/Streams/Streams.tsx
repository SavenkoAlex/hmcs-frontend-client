import {
  defineComponent,
  VNode,
  ref
} from 'vue'

// janus
import Janus, { JanusJS } from 'janus-gateway'
import adapter from 'webrtc-adapter'

// Style
import '@/components/Streams/Streams.scss'

/** types */
import { Room } from '@/types/global'
import { StreamsData } from '@/components/Streams/types'

//SVG
import { RouterLink } from 'vue-router'

/** api */
import userApi from '@/api/user'

/** components */
import StreamItem from '@/components/Streams/StreamItem'

export default defineComponent({

  name: 'Streams',

  components: {
    StreamItem
  },

  setup () {
    const rooms = ref <Room[]>()
    const pluginHandler = ref <JanusJS.PluginHandle> ()
    /*
    const janus = Janus.init({
      debug: true,
      dependencies: Janus.useDefaultDependencies({ adapter })
    })
    */
    const janusUnit = ref <Janus> ()

    return {
      rooms,
      janusUnit,
      pluginHandler,
    }

  },

  data(): StreamsData {
    return {
      users: []
    }
  },

  methods: {
    attachPlugin () {
      if (!this.janusUnit) {
        throw new Error ('No janus instanse available') 
      }

      this.janusUnit?.attach({
        plugin: 'janus.plugin.videoroom',

        success: (handler) => {
          this.pluginHandler = handler
          this.getRooms()
            .then(result => { this.rooms = result; console.log(result)})
            .catch(err => { this.rooms = []; console.error(err) }) 
        },

        onmessage: (msg) => {
          Janus.debug(msg)
        },

        error: (err) => {
          Janus.error(err)
        }
      })
    },

    createOffer (): Promise <JanusJS.JSEP | false> {
      return new Promise ((resolve, reject) => {
        
        if (!this.pluginHandler) {
          reject('No plugin available')
          return
        }

        this.pluginHandler?.createOffer({
          success: (jsep) => resolve (jsep),
          error: (err) => resolve(false)
        })
      })
    },

    getRooms (): Promise <Room[]> {
      return new Promise ((resolve, reject) => {
        if (!this.pluginHandler) {
          reject('No plugin handler available')
          return
        }

        const message = {
          request: 'list'
        }

        this.pluginHandler.send({
          message,
          success: result => resolve(result.list),
          error: error => reject(error)
        })
      })
    }
  },


  async mounted () {

    const users  = await userApi.getUsers()
    if (users && users.length > 0) {
      this.users = users
    }
    /*
    this.janusUnit = new Janus({
      server: '/janus',
      success: this.attachPlugin,
      error: err => console.log('jauns erroor: ', err),
      destroyed: () => console.warn('janus destroyed'),
    })
      */

  },

  unmounted () {
    this.janusUnit?.destroy({
      cleanupHandles: false,
      unload: true
    })
  },
    
  render (): VNode {
    return <div class='streamer-list'>
        {
          this.users.map(user => 
            <div class='streamer-list__item'>
              <StreamItem stream={user} />
            </div>
          )
        }
    </div>

  }
})
