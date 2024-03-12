import {
  defineComponent,
  ref,
  VNode
} from 'vue'

import Janus, { JanusJS } from 'janus-gateway'
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'

// Style
import '@/components/Subscriber/Subscriber.scss'


export default defineComponent({

  name: 'Subscriber',

  setup () {

    const remoteStream = ref <MediaStream> ()
    const remoteVideoNode = ref <HTMLMediaElement> ()

    const constraints = {
      audio: false,
      video: false
    }

    const subscriberName = ref <string>('sasha the programmer')

    const mountPoint = ref <number> ()
    const pluginHandler = ref <JanusJS.PluginHandle> ()

    const videoTrack = ref <MediaStreamTrack | null>()
    const audioTrack = ref <MediaStreamTrack | null> ()

    return {
      remoteStream,
      remoteVideoNode,
      constraints,
      pluginHandler,
      videoTrack,
      audioTrack,
      mountPoint,
      subscriberName
    }
  },

  methods: {

    onremotetrack (descripption: {on: boolean, track: MediaStreamTrack}) {
      const { on, track } = descripption
      console.warn('REMOTe Track', on, track)
      
      this.remoteStream = new MediaStream([track])

      if (this.remoteStream && this.remoteVideoNode) {
        Janus.attachMediaStream(this.remoteVideoNode, this.remoteStream)
      }
    },
  },

  async mounted () {
    this.mountPoint = Number.parseInt(this.$route.path.split('/')[2], 10)
    const handler = await SubscriberStreamHandler.init(Janus, { 
      mountId: this.mountPoint, 
      displayName: this.subscriberName  
    })

    handler?.emitter.on('track', description => {
      this.onremotetrack(description)
    }) 
    
    await handler?.join()
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
