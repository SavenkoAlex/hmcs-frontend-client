import {
  defineComponent,
  VNode,
  PropType,
  ref
} from 'vue'

import janusGateway from 'janus-gateway'
import adapter from 'webrtc-adapter'

export default defineComponent({
  
  name: 'User',

  props: {
    //
  },

  setup () {
    const userVideo = ref <HTMLVideoElement>()
    const clientVideo = ref <HTMLVideoElement>()

    const stream = ref<MediaProvider>()
    const opaqueId = 'streamingTest' + janusGateway.randomString(12)
    const streaming = ref()
    const janusInstance = ref<janusGateway>()

    const janus = janusGateway.init({
      debug: true,
      dependencies: janusGateway.useDefaultDependencies({adapter}),
      callback: function() {
        console.warn('Janus initiated')
      }
    })

    return {
      janus,
      userVideo,
      clientVideo,
      stream,
      opaqueId,
      streaming,
      janusInstance
    }
  },

  methods: {
    async startUp () {

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      } catch (err) {
        console.log(err)
      }

      if (this.userVideo && this.stream) {
        this.userVideo.srcObject = this.stream
      }
    },

    updateStreamList() {
      if (!this.streaming) {
        console.error('no streaming available')
        return 
      }
      let body = { request: 'list' }
      this.streaming.send({ message: body, success: (result: unknown) => {
        console.log('send result: ', result)
      }})
    },

    successJanusHandler () {
      if (!this.janusInstance) {
        return
      }

      this.janusInstance.attach({
        plugin: 'janus.plugin.streaming',
        opaqueId: this.opaqueId,
        success: pluginHandle => {
          this.streaming = pluginHandle
          janusGateway.log("Plugin attached! (" + this.streaming.getPlugin() + ", id=" + this.streaming.getId() + ")");
          this.updateStreamList()
        },
        error: (err) => {
          janusGateway.error("  -- Error attaching plugin... ", err)
        },
        iceState: (state) => {
          janusGateway.log('ice state changed to ', state)
        },
        webrtcState: on => {
          janusGateway.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
        },
        slowLink: (uplink, lost, mid) => {
          janusGateway.warn("Janus reports problems " + (uplink ? "sending" : "receiving") +
            " packets on mid " + mid + " (" + lost + " lost packets)");
        },
        onmessage: (msg, jsep) => {
          janusGateway.debug('Got a message', msg)
          
          if (jsep && this.streaming) {
            janusGateway.debug("Handling SDP as well...", jsep)
            let stereo = jsep.sdp && jsep.sdp.indexOf("stereo=1") !== -1
            this.streaming.createAnswer({
              jsep,
              tracks: [{ type: 'data' }],
              customizeSdp: (jsep: { sdp: string }) => {
                if (stereo && jsep?.sdp.indexOf('stereo=1') == -1) {
                  jsep.sdp = jsep.sdp.replace("useinbandfec=1", "useinbandfec=1;stereo=1")
                }
              },
              success: (jsep: unknown) => {
                janusGateway.debug('Got SDP!', jsep)
                const body = { request: 'start' }
                this.streaming.send({ message: body, jsep })
              },
              error: (err: Error) => {
                janusGateway.error('WebRtc error', err)
              }
            })
          }
        },
      })
    }
  },

  async mounted () {
    await this.startUp()

    this.janusInstance = new janusGateway({
      server: '/janus',
      success: this.successJanusHandler,
      error: (err) => console.error('janus error: ', err),
      destroyed: () => console.log('janus destroyed')
    })
  },


  render(): VNode {
    return <div class={'user-profile'}>
      <div class='camera col-12'>
        
        <video  ref={'userVideo'} class='col-6' autoplay> 
          Video stream not available.
        </video>
        
        <video ref={'clientVideo'} class='col-6' autoplay>
          Video stream not available.
        </video>
      </div>
    </div>
  }
})
