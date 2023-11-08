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

    const localStream = ref <MediaStream> ()
    const remoteStream = ref <MediaStream> ()

    const localVideoNode = ref <HTMLVideoElement> ()
    const remoteVideoNode = ref <HTMLVideoElement> ()

    const roomId = ref <number> ()

    const constraints = {
      audio: false,
      video: true
    }

    const janus = Janus.init({
      debug: true,
      dependencies: Janus.useDefaultDependencies({ adapter })
    })

    const janusUnit = ref <Janus> ()
    const pluginHandler = ref <JanusJS.PluginHandle> ()

    const videoTrack = ref <MediaStreamTrack | null>()
    const audioTrack = ref <MediaStreamTrack | null> ()
    const rooms = ref <{list: Room[]}> ()
    const publishers = ref <Publisher[]> ()
    const publisher = ref < number > ()


    return {
      localStream,
      remoteStream,
      localVideoNode,
      remoteVideoNode,
      roomId,
      constraints,
      janus,
      janusUnit,
      pluginHandler,
      videoTrack,
      audioTrack,
      publishers,
      publisher,
      rooms
    }
  },

  computed: {
    roomsList (): string[] {
      if (!this.rooms) {
        return []
      }
      return ['00001'].concat(...this.rooms.list
        .filter(el => el.description === 'filterIT')
        .map(el => String(el.room)))
    },

    participants () {
      if (!this.publishers) {
        return []
      }

      return [1]
        .concat(
          this.publishers?.filter(el => el.display === 'filterIT')
          .map(el => el.id)
        )
    }

  },

  watch: {
    roomId () {
      this.getPublishers().then((result) => {
        this.publishers = result.participants
      })
    },

    localStream (newValue : MediaStream | null) {
      if (!newValue) {
        this.videoTrack = null
        this.audioTrack = null
        return
      }

      this.videoTrack = newValue.getVideoTracks()[0]
      this.audioTrack = newValue.getAudioTracks()[0]
    },
  },


  methods: {

    createOffer () {
      if (!this.pluginHandler || !this.audioTrack || !this.videoTrack) {
        return
      }

      this.pluginHandler.createOffer({
        tracks: [{
          type: 'audio',
          capture: this.audioTrack
        }, {
          type: 'video',
          capture: this.videoTrack
        }],
        success: data => this.pluginHandler?.send({message: { request: 'offer' }, jsep: data}),
        error: err => Janus.error(err),
      })
    },

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

    getRooms (): Promise <{list: Room[]}> {
      return new Promise ((resolve, reject) => {
        if (!this.pluginHandler) {
          reject('No plugin handler available')
        }
        const message = {
          request: 'list'
        }

        this.pluginHandler?.send({
          message,
          success: data => resolve(data),
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
            feed: this.publisher
          }]
        }

        this.pluginHandler?.send({
          message,
          success: result => resolve(result),
          error: err => reject(err)
        })
      })

    },

    attachPlugin () {
      if (!this.janusUnit) {
        throw new Error ('No janus instanse available') 
      }

      this.janusUnit?.attach({
        plugin: 'janus.plugin.videoroom',

        success: (handler) => {
          this.pluginHandler = handler
          
          this.getRooms().then((result: { list: Room[] }) => {
            if (result) {
              this.rooms = result
            }
          })
        },

        onmessage: (msg, jsep) => console.log('msg is ', msg)
      })
    },

    setActiveRoom (roomId: string): void {
      if (!this.rooms?.list) {
        this.roomId = 0
      }
      const id = Number.parseInt(roomId, 10)
      const room = this.rooms?.list.find(el => el.room === id)
      if (room) {
        this.roomId = room.room
      }
    },

    setActivePublisher(publisherId: string): void {
      if (!this.publishers) {
        this.publisher = 0
      } 
      const id = Number.parseInt(publisherId, 10)
      const publisher = this.publishers?.find(el => el.id === id)
      if (publisher) {
        this.publisher = publisher.id
      }
    },

    connect() {
      this.join().then(result => {
        console.log('result', result)
      })
    },

     /**
     * Obtains an user media stream 
     * @returns media stream or null if not available
     */
    getUserMedia (): Promise <MediaStream | null> {
      return navigator.mediaDevices.getUserMedia(this.constraints)
        .then(stream => {
          return stream || null
        })
        .catch (err => {
          console.error(err)
          return null
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

    this.getUserMedia().then(result => {
      if (result) {
        this.localStream = result
      }
    })
  },

  render (): VNode {
    return <div class="container">
      <div class="videoContainer col-12">
        <div class="localvideo">
          <video ref='localVideNode' autoplay srcObject={this.localStream}> Video is not supported </video>
        </div>
        <div class="remotevideo">
          <video ref='remoteVideNode' autoplay srcObject={this.remoteStream}> Video is not supported </video>
        </div>
      </div>

      <div class='controls col 6'>
        
        <div class="rooms-selector col-3">
          <label for="roomSelector">
            Choose Room
          </label>
          <select name='roomSelector'
            onChange={($event) => this.setActiveRoom(($event.target as HTMLInputElement).value)}
          >
            {
              this.roomsList.map(el => <option> {el} </option>)
            }
          </select>
        </div>

        <div class='publisher-selector'>
          <label for="roomSelector">
            Choose Publisher
          </label>
          <select name='publisherSelector'
            onInput={($event) => this.setActivePublisher(($event.target as HTMLInputElement).value)}
          >
            {
              this.participants.map(el => <option> {el} </option>)
            }
          </select>
        </div>
        <button
          onClick={this.connect}
        >
          Connect
        </button>
      </div>
    </div>
  }
})
