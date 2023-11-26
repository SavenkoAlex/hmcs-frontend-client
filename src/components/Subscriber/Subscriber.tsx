import {
  defineComponent,
  InputHTMLAttributes,
  ref,
  VNode
} from 'vue'

import Janus, { JanusJS } from 'janus-gateway'
import adapter from 'webrtc-adapter'

// Style

import '@/components/Subscriber/Subscriber.scss'

type Room = {
  room: number
  description: string
}

type Publisher = {
  id: number, 
  display: string, 
  publisher: boolean
}

export default defineComponent({

  name: 'Subscriber',

  setup () {

    const remoteStream = ref <MediaStream> ()
    const remoteVideoNode = ref <HTMLMediaElement> ()

    const roomId = ref <number> ()
    const constraints = {
      audio: false,
      video: false
    }

    const janus = Janus.init({
      debug: true,
      dependencies: Janus.useDefaultDependencies({ adapter })
    })

    const janusUnit = ref <Janus> ()
    const pluginHandler = ref <JanusJS.PluginHandle> ()

    const videoTrack = ref <MediaStreamTrack | null>()
    const audioTrack = ref <MediaStreamTrack | null> ()
    const publishers = ref <Publisher[]>()
    const publisher = ref <Publisher> ()


    return {
      remoteStream,
      remoteVideoNode,
      roomId,
      constraints,
      janus,
      janusUnit,
      pluginHandler,
      videoTrack,
      audioTrack,
      publisher,
      publishers
    }
  },

  methods: {

    getPublishers (): Promise <{participants: Publisher[]}> {
      return new Promise ((resolve, reject) => {
        if (!this.pluginHandler) {
          reject('No plugin handler available')
        }

        const message = {
          request: 'listparticipants',
          room: this.roomId
        }

        this.pluginHandler?.send({
          message,
          success: (res) => resolve(res),
          error: err => reject(err)
        })
      })

    },

    join () {
      return new Promise ((resolve, reject) => {
        if (!this.pluginHandler) {
          reject('No plugin handler available')
        }

        const message = {
          request: 'join',
          ptype: 'subscriber',
          room: this.roomId,
          streams: [{
            feed: this.publisher?.id
          }]
        }

        this.pluginHandler?.send({
          message,
          success: result => resolve(result),
          error: err => reject(err)
        })
      })

    },

    async getPublisher (): Promise <void> {
      const publishers = await this.getPublishers()
      const publisher = publishers.participants.filter(x => x.publisher)
      if (publisher.length) {
        this.publisher = publisher[0]
      }
    },

    attachPlugin () {
      if (!this.janusUnit) {
        throw new Error ('No janus instanse available') 
      }

      this.janusUnit?.attach({
        plugin: 'janus.plugin.videoroom',

        success: async (handler) => {
          this.pluginHandler = handler
          await this.getPublisher()
          this.join()
        },

        onmessage: (msg: JanusJS.Message, jsep?: JanusJS.JSEP) => {
          
          const event = msg['videoroom']

          if (event === 'attached') {
            console.warn('ATTACHED', msg)
          }

          if (jsep) {
            this.pluginHandler?.createAnswer({
              jsep,
              success: (sdp) => this.connect(sdp)
            })
          }

        },
        onremotetrack: (track, mid, on, metadata) => {
          console.warn('REMOTe Track', on, track)
          this.remoteStream = new MediaStream([track])

          if (this.remoteStream && this.remoteVideoNode) {
            Janus.attachMediaStream(this.remoteVideoNode, this.remoteStream)
          }
        },
      })
    },

    connect(sdp: JanusJS.JSEP): Promise <true | false> {
      return new Promise ((resolve, reject) => {
        if (!this.pluginHandler) {
          reject('No plugin available')
          return
        }

        const message = {
          request: 'start',
        }

        this.pluginHandler.send({ 
          message,
          jsep: sdp,
          success: (data) => { console.log('DATA', data); resolve(true) },
          error: (error) => resolve(false)
         })
      })
    },

  },

  mounted () {
    this.janusUnit = new Janus({
      server: '/janus',
      success: this.attachPlugin,
      error: err => console.log('jauns erroor: ', err),
      destroyed: () => console.warn('janus destroyed')
    })
    this.roomId = Number.parseInt(this.$route.path.split('/')[2], 10)
    // this.getPublisher()
  },

  render (): VNode {
    return <div class='row'>
      <div class="col-12">
        <div class="remotevideo col-6">
          <video srcObject={this.remoteStream} ref={'remoteVideoNode'} autoplay > 
            Video is not supported 
          </video>
        </div>
      </div>
    </div>
  }
})
