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

/** layouts */
import RoomLayout from '@/layouts/Room/Room'

export default defineComponent({

  name: 'Subscriber',

  components: {
    Chat,
    BaseVideo,
    StateBar,
    RoomLayout
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
    const videoPluginHandler = ref <SubscriberStreamHandler | null> (null)
    const chatPluginHandler = ref <SubscriberStreamHandler | null> (null)
    const videoTrack = ref <MediaStreamTrack | null>()
    const audioTrack = ref <MediaStreamTrack | null> ()

    return {
      remoteStream,
      remoteVideoNode,
      constraints,
      videoPluginHandler,
      chatPluginHandler,
      videoTrack,
      audioTrack,
      mountPoint,
      subscriberName
    }
  },

  data (): Data {
    return {
      publisher: null,
      publisherAccount: null,
    }
  },

  methods: {

    /** get data according to publisher */
    async getUserData () {
      if (!this.publisherId) {
        return null
      }
      const user = await userApi.getUser(this.publisherId)
      return user || null
    },

    onremotetrack (descripption: {on: boolean, track: MediaStreamTrack}) {
      const { track } = descripption
      this.remoteStream = new MediaStream([track])
      if (this.remoteStream && this.remoteVideoNode) {
        Janus.attachMediaStream(this.remoteVideoNode, this.remoteStream)
      }
    },

    collapseVideo (event: Event) {
      const video = event.target as HTMLVideoElement
      video.play()
    },

    /** initiate webrtc video handler */
    async initVideoRoomHandler () {
      const handler = await SubscriberStreamHandler.init(Janus, { 
        streamId: this.mountPoint, 
        displayName: this.subscriberName  
      })

      handler?.emitter.on('track', description => {
        this.onremotetrack(description)
      })

      this.videoPluginHandler = handler

      return await handler?.join()
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
    // TODO: is publiisher online ? init all Handlers
    this.initVideoRoomHandler()
  },

  unmounted () {
    this.videoPluginHandler?.handler.detach()
    this.chatPluginHandler?.handler.detach()
  },

  render (): VNode {
    return <RoomLayout>
      {{
        media: () => <div class="subscriber__publisher-media">
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
        </div>,
        controls: () => <div class='subscriber__stream-controls'>
          <StateBar
            userRole={this.getUser?.role || StreamRole.OBSERVER}
            amount={this.publisherAccount?.amount}
          />
        </div>,

        chat: () => <div class='subscriber__content'>
          <Chat/>
        </div>
      }}
      </RoomLayout>
  }

})
