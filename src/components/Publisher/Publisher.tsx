
import {
  defineComponent,
  VNode,
  ref
} from 'vue'

// janus
import Janus, { JanusJS } from 'janus-gateway'
import adapter from 'webrtc-adapter'

// Style
import './Publisher.scss'

export default defineComponent({

  name: 'Publisher',

  setup () {
    const publisherNode = ref <HTMLMediaElement> ()
    const clientNode = ref <HTMLVideoElement> ()

    const publisherStream = ref <MediaStream> ()
    const clientStream = ref <MediaStream> ()

    const roomId = Math.floor(Math.random() * 10000)
    const publisherId = Math.floor(Math.random() * 100)

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
    const publishers = ref <{id: number, display: string, publisher: boolean}[]> ()

    return {
      publisherNode,
      clientNode,
      publisherStream,
      clientStream,
      roomId,
      publisherId,
      constraints,
      janus,
      janusUnit,
      pluginHandler,
      videoTrack,
      audioTrack,
      publishers
    }
  },

  watch: {
    publisherStream (newValue : MediaStream | null) {
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

    /**
     * Init Janus plugin
     */
    attachPlugin () {
      if (!this.janusUnit) {
        throw new Error ('No janus instanse available') 
      }

      this.janusUnit?.attach({
        plugin: 'janus.plugin.videoroom',

        success: (handler) => {
          this.pluginHandler = handler
        },

        onmessage: this.onMessage,
        webrtcState: this.onWebrtcState,
        onlocaltrack: (track: MediaStreamTrack, on: boolean) => {
          console.warn('LOCAL Track', on, track)
          this.clientStream = new MediaStream([track])

          if (this.clientStream && this.clientNode) {
            Janus.attachMediaStream(this.clientNode, this.clientStream)
          }
        }, 
      })
    },

    onWebrtcState (isConnected: boolean): void | undefined {
      Janus.log("Janus says our WebRTC PeerConnection is " + (isConnected ? "up" : "down") + " now");
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

    /**
     * create room request 
     * @returns 
     */
    create (): Promise <true | false> {

      return new Promise ((resolve, reject) => {
        if (!this.pluginHandler) {
          reject('No plugin available')
        }

        const message = {
          request: 'create',
          room: this.roomId,
          description: 'RoomOwner',
        }

        this.pluginHandler?.send({
          message,
          success: (result) => {
            console.warn(`room ${this.roomId} created`, result)
            resolve(true)
          },
          error: (err) => {
            console.error('Error while requesting room creation ', err)
            resolve(false)
          }
        })
      })
    },

    createAndJoin() {
      this.create().then((result) => {
        if (result) {
          this.joinAsPublisher()
        } else {
          Janus.debug('Can not create a room')
        }
      })
    },

    /**
     * destroy room request
     * @returns 
     */
    destroyRoom (): Promise <true | false> {
      return new Promise ((resolve, reject) => {
        if (!this.pluginHandler) {
          reject('No plugin available')
        }

        const message = {
          request: 'destroy',
          room: this.roomId,
        }

        this.pluginHandler?.send({
          message,
          success: () => resolve(true),
          error: () => resolve(false)
        })
      })
    },

    /**
     * Join room request
     */
    joinAsPublisher (): Promise <true | false> {
      return new Promise ((resolve, reject) => {
        if (!this.pluginHandler) {
          reject('No plugin available')
        }

        const message = {
          request: 'join',
          ptype: 'publisher',
          room: this.roomId,
          id: this.publisherId,
          display: 'filterIT'
        }

        this.pluginHandler?.send({
          message,
          success: () => resolve(true),
          error: () => resolve(false)
        })
      })
    },

    /**
     * 
     * @param streams 
     * @returns 
     */
    configure (streams: { mid: string }[] | undefined): Promise < true | false > {

      return new Promise ((resolve, reject) => {
        if (!this.pluginHandler) {
          reject('No plugin available')
          return
        }

        const message: { 
          request: string, 
          keyframe: boolean, 
          streams?: unknown[] 
        } = {
          request: 'configure',
          keyframe: true,
          streams: []
        }

        if (streams) {
          for (const stream of streams) {
            stream.mid = this.publisherStream?.id || String(0)
          }
          message.streams = streams
        }        

        this.pluginHandler.send({
          message,
          success: () => resolve(true),
          error: () => resolve(false)
        })
      })
    },

    createOffer (): Promise <JanusJS.JSEP | false> {
      return new Promise ((resolve, reject) => {
        
        if (!this.pluginHandler || !this.videoTrack) {
          reject('No plugin available')
          return
        }

        this.pluginHandler?.createOffer({
          tracks: [{
            type: 'video',
            capture: this.videoTrack
          }],
          success: (jsep) => resolve (jsep),
          error: (err) => resolve(false)
        })
      })
    },

    /**
     * publish request
     */
    publish (jsep: JanusJS.JSEP): Promise <true | false> {

      return new Promise ((resolve, reject) => {
        if (!this.pluginHandler) {
          reject('No plugin available')
        }

        const message = {
          request: 'publish',
          display: `roomOwner`,
          audio: false,
          video: true,
          descriptions: [{
            mid: this.publisherStream?.id || String(0),
            description: 'poxui'
          }]
        }

        this.pluginHandler?.send({
          message,
          jsep,
          success: (result) => { console.log('PUBLISH REQUEST SEND'); resolve(true) },
          error: err => resolve(false)
        })
      })
    },
    
    /**
     * On message event handler
     * @param msg 
     * @param jsep 
     */
    onMessage (msg: JanusJS.Message, jsep: JanusJS.JSEP | undefined): void {
      
      const event = msg['videoroom']

      if (event === 'joined') {
        this.createOffer().then(jsep => {
          if (jsep) {
            this.publish(jsep).then(() => console.warn('CONFIGURED'))
          } else {
            Janus.error('No offer generated')
          }
        })
      }

      if (jsep) {
        this.pluginHandler?.handleRemoteJsep({jsep})
      }

    },

    getPublishers () {
      const message = {
        request: 'list',
      }

      this.pluginHandler?.send({
        message,
        success: (res) => { this.publishers = res.list || [] },
        error: (err) => { this.publishers = []; console.error(err) }
      })
    },

    async startStream (): Promise <void> {

      const jsep = await this.createOffer()

      if (!jsep) {
        console.error('no JSEP')
        return
      }
    }

  },

  mounted () {
    this.janusUnit = new Janus({
      server: '/janus',
      success: this.attachPlugin,
      error: err => console.log('jauns erroor: ', err),
      destroyed: () => console.warn('janus destroyed'),
    })

    this.getUserMedia().then(result => {
      if (result) {
        this.publisherStream = result
      }
    })
  },

  unmounted () {
    this.destroyRoom()
  },

  render (): VNode {
    return <div class="container">
      <div class="publisher">
        <video srcObject={this.publisherStream} ref={'publisherNode'} autoplay> Video is not supportd </video>
      </div>
      <div class='client'>
        <video srcObject={this.clientStream} ref={'clientNode'} autoplay> Video is not supportd </video>
      </div>
      <div class="controls col-12">
        <button
          class='col-3'
          onClick={this.createAndJoin}
        > 
          Create Room 
        </button>
        
        <button
          class='col-3'
          onClick={this.startStream}
        > 
          Publish 
        </button> 
        <button
          class='col-3'
          onClick={this.getPublishers}
        >
          get participants
        </button>
        <button
          onClick={() => console.log(this.pluginHandler?.getId())}
        >
          Get ID
        </button>
      </div>
    </div>
  }
})
