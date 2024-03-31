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

// Types
import { Room } from '@/global/global'

//SVG
import LogoIcon from '@/assets/images/logo48.svg'
import { RouterLink } from 'vue-router'

export default defineComponent({

  name: 'Streams',

  setup () {
    const rooms = ref <Room[]>()
    const pluginHandler = ref <JanusJS.PluginHandle> ()
    const janus = Janus.init({
      debug: true,
      dependencies: Janus.useDefaultDependencies({ adapter })
    })

    const janusUnit = ref <Janus> ()

    return {
      rooms,
      janus,
      janusUnit,
      pluginHandler
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
          this.getRooms().then(result => { this.rooms = result; console.log(result)})
        },

        onmessage: (msg) => {
          Janus.debug(msg)
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


  mounted () {
    this.janusUnit = new Janus({
      server: '/janus',
      success: this.attachPlugin,
      error: err => console.log('jauns erroor: ', err),
      destroyed: () => console.warn('janus destroyed'),
    })

  },

  unmounted () {
    this.janusUnit?.destroy({
      cleanupHandles: false,
      unload: true
    })
  },
    
  render (): VNode {
    return <div class='rooms-list'>
        {
          this.rooms?.map(room => {
            return <div class='room_item'>
              <div class='room_container'>
                <h5> {`Room № ${room.room}`} </h5>
                <h6> { room.description || 'No description' } </h6>
                <RouterLink to={{name: 'live', params: { id: room.room }}}>
                  <LogoIcon/>
                </RouterLink>
              </div>
            </div>
          })
        }
    </div>

  }
})
