import {
  defineComponent,
  VNode,
  PropType
} from 'vue'

/* styles */
import '@/components/StateBar/StateBar.scss'

/** types */
import {
  UserRole,
  StreamRole,
  ElementScale
} from '@/types/global'

import { Data } from '@/components/StateBar/types'

import { BarConfiguration, BarConfigutations, StateBarElements } from '@/components/StateBar/types'

/** components */
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import IconButton from '@/components/general/Buttons/IconButton/IconButton'
import LiveIndicator from '@/components/LiveIndicator/LiveIndicator'
import DeviceController from '@/components/DeviceController/DeviceController'
import MicMuteController from '@/components/MicMuteController/MicMuteController'
import CameraMuteController from '@/components/CameraMuteController/CameraMuteController'
import StreamController from '@/components/StreamController/StreamController'
import AccountIndicator from '@/components/AccountIndicator/AccountIndicator'

/** icons */
import AddCallIcon from '@/assets/images/video_call_32.svg'
import PayIcon from '@/assets/images/credit_card_32.svg'

export default defineComponent({

  name: 'StateBar',

  components: {
    TextButton,
    IconButton,
    DeviceController,
    MicMuteController,
    AccountIndicator
  },

  props: {
    /** logged user role */
    userRole: {
      type: String as PropType <UserRole>,
      required: true,
    },
    /** is stream available */
    isStreamAvailable: {
      type: Boolean as PropType <boolean>,
      default: false
    },
    /** do we have a stream */
    isStreamActive: {
      type: Boolean as PropType <boolean>,
      default: false
    },
    amount: {
      type: Number as PropType <number>,
      default: 0
    }
  },

  emits: [
    'streamtoggle',
    'muteAudio',
    'muteVideo',
    'updateDevices',
    'applydevices'
  ],

  computed: {

    barElements () {
      if (this.userRole === UserRole.ANONYMOUS) {
        return BarConfigutations[StreamRole.OBSERVER]
      } else if (this.userRole === UserRole.USER && this.isStreaming) {
        return BarConfigutations[StreamRole.SUBSCRIBER]
      } else if (this.userRole === UserRole.USER && !this.isStreaming) {
        return BarConfigutations[StreamRole.OBSERVER]
      } else if (this.userRole === UserRole.WORKER && this.isStreaming) {
        return BarConfigutations[StreamRole.PUBLISHER]
      } else if (this.userRole === UserRole.WORKER && !this.isStreaming) {
        return BarConfigutations[StreamRole.PUBLISHER_OFFLINE]
      }

      return BarConfigutations[StreamRole.OBSERVER]
    },

    streamButtonText () {
      return this.isStreaming
        ? this.$t('pages.stateBar.stopStream')
        : this.$t('pages.stateBar.startStream')
    }
  },

  data (): Data {
    return {
      userAccountId: null,
      userId: null,
      live: false,
      isStreaming: true,
      isRequestActive: false,
      user: null,
      account: null,
      isCameraMuted: false,
      isMicMuted: false
    }
  },

  methods: {

    onAudioMute () {
      this.isMicMuted = !this.isMicMuted
      this.$emit('muteAudio', this.isMicMuted)
    },

    onVideoMute () {
      this.isCameraMuted = !this.isCameraMuted
      this.$emit('muteVideo', this.isCameraMuted)
    }
  },

  render (): VNode {
    
    const live = <div class='state-bar__live'>
      <LiveIndicator
        live={false}
      />
    </div>

    const joinreq = <div class='state-bar__joinreq'>
        <IconButton
          mode={'tertiary'}
          disabled={!this.isRequestActive}
        >
          <AddCallIcon/>
        </IconButton>
    </div>

    const devices = <DeviceController
      onApplydevices={() => this.$emit('applydevices')}
    />

    const mic = <MicMuteController 
      modelValue={this.isMicMuted}
      // TODO: Do check
      onUpdate:modelValue={this.onAudioMute}
    />
    const camera = <CameraMuteController 
      modelValue={this.isCameraMuted}
      // TODO: Do check
      onUpdate:modelValue={this.onVideoMute}  
    />
    const increase = <div class='state-bar__increase'>
      <IconButton
        mode={'primary'}
      >
        <PayIcon/>
      </IconButton>
    </div>

    const amount = <AccountIndicator
      mode={ElementScale.MEDIUM}
      amount={this.amount}
    />

    const fee = <div class='state-bar_fee'></div>

    const stream = <StreamController
      modelValue={this.isStreamActive}
      onUpdate:modelValue={() => this.$emit('streamtoggle')}
      isHandlerAvailable={this.isStreamAvailable}
    />

    const empty = <div></div>

    const elements: Record <StateBarElements, VNode> = {
      live,
      joinreq,
      devices,
      camera,
      mic,
      increase,
      amount,
      fee,
      stream,
      empty
    }

    return <div class='state-bar'>
      {
        this.barElements 
          ? this.barElements.map((item, index) => {
            return <div 
              style={{ 'grid-column': `${index + 1} / ${index + 1}`, 'grid-row': 1 }}> 
                { elements[item] || null } 
              </div>
          })
          : null
      }  
    </div>
  }
})
