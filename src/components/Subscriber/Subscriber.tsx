import {
  defineComponent,
  ref,
  TransitionGroup,
  Transition,
  VNode,
} from 'vue'

/** store */
import { mapGetters } from 'vuex'

import Janus, { JanusJS } from 'janus-gateway'
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'

/** style */
import '@/components/Subscriber/Subscriber.scss'

/** components */
import Chat from '@/components/Chat/Chat'
import BaseVideo from '@/components/Video/Video'
import StateBar from '@/components/StateBar/StateBar'

/** api */
import userApi from '@/api/user'

/** types */
import { Data } from '@/components/Subscriber/types'
import { StreamRole } from '@/types/global'

export default defineComponent({

  name: 'Subscriber',

  components: {
    Chat,
    BaseVideo,
    StateBar
  },

  computed: {
    ...mapGetters('user', ['getUser']),
    publisherId () {
      const publisherId: string | undefined = Array.isArray(this.$route.params?.id) 
        ? this.$route.params.id[0]
        : this.$route.params.id as string

      if (!publisherId) {
        return null
      }

      return publisherId
    },
  },

  setup () {

    const remoteStream = ref <MediaStream> ()
    const remoteVideoNode = ref <HTMLMediaElement> ()

    const constraints = {
      audio: false,
      video: true
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

  data (): Data {
    return {
      publisher: null,
      publisherAccount: null
    }
  },

  methods: {
    async getUserData () {
      if (!this.publisherId) {
        return null
      }

      const user = await userApi.getUser(this.publisherId)

      return user || null
    },

    onremotetrack (descripption: {on: boolean, track: MediaStreamTrack}) {
      const { on, track } = descripption
      console.warn('REMOTe Track', on, track)
      
      this.remoteStream = new MediaStream([track])

      if (this.remoteStream && this.remoteVideoNode) {
        Janus.attachMediaStream(this.remoteVideoNode, this.remoteStream)
      }
    },

    collapseVideo (event: Event) {
      const video = event.target as HTMLVideoElement
      video.play()
    }
  },

  async mounted () {

    if (!this.publisherId) {
      return
    }

    this.publisher = await this.getUserData()

    if (!this.publisher) {
      return
    }

    if (this.publisher.streamId) {
      this.mountPoint = this.publisher.streamId
    }

    if (!this.mountPoint) {
      return
    }

    const handler = await SubscriberStreamHandler.init(Janus, { 
      streamId: this.mountPoint, 
      displayName: this.subscriberName  
    })

    handler?.emitter.on('track', description => {
      this.onremotetrack(description)
    })
    
    handler?.join()
  },

  render (): VNode {
    return <div class='subscriber'>
        <div class="subscriber__publisher-media">
          { this.remoteStream 
            
            ? <TransitionGroup>
              <BaseVideo
                srcObject={this.remoteStream}
                autoplay
                playsinline
              />
              </TransitionGroup>
            : <Transition name='offline'>
                <div class={'subscriber__publisher-avatar'}>
                  <img src={`data:image/jpg;base64,${this.publisher?.avatar}`}/>
                </div>
              </Transition>
          }
        </div>
        <div class='subscriber__stream-controls'>
          <StateBar
            userRole={this.getUser?.role || StreamRole.OBSERVER}
          />
        </div>
        <div class='subscriber__content'>
          <Chat/>
        </div>
      </div>
  }
})
