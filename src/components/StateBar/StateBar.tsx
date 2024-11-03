import {
  defineComponent,
  VNode,
  PropType,
  useTemplateRef
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

import { BarConfigutations, StateBarElements } from '@/components/StateBar/types'

/** components */
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import IconButton from '@/components/general/Buttons/IconButton/IconButton'
import LiveIndicator from '@/components/LiveIndicator/LiveIndicator'
import DeviceController from '@/components/DeviceController/DeviceController'
import MicMuteController from '@/components/MicMuteController/MicMuteController'
import CameraMuteController from '@/components/CameraMuteController/CameraMuteController'
import StreamController from '@/components/StreamController/StreamController'
import AccountIndicator from '@/components/AccountIndicator/AccountIndicator'
import HidePanelController from '@/components/HidePanelController/HidePanelController'

/** icons */
import AddCallIcon from '@/assets/images/small/video_call_16dp.svg'
import PayIcon from '@/assets/images/small/send_money_16dp.svg'

export default defineComponent({

  name: 'StateBar',

  components: {
    TextButton,
    IconButton,
    DeviceController,
    MicMuteController,
    AccountIndicator,
    HidePanelController,
  },

  props: {
    /** logged user role */
    userRole: {
      type: String as unknown as PropType <UserRole>,
      required: true,
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
    'applydevices',
    'showdevicesconfiguration',
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
    },

    panelStyle () {
      return this.isControlHidden
        ? 'state-bar__panel_hidden'
        : 'state-bar__panel'
    },
    
    controlStyle () {
      return this.isControlHidden
        ? 'state-bar__control_hidden'
        : 'state-bar__control'
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
      isMicMuted: false,
      isControlHidden: false,
      isDeviceConfigurationVisible: false
    }
  },

  setup () {
    const stateBar = useTemplateRef <HTMLElement> ('statebar')

    return {
      stateBar
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
    },

    collapsePanel(isHidden: boolean): void {
      this.isControlHidden = isHidden
    },
  },

  render (): VNode {
    
    const live = <div class='state-bar__live'>
      <LiveIndicator
        live={this.isStreamActive}
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
      onShowdevicesconfiguration={() => this.$emit('showdevicesconfiguration')}
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
    />

    const hide = <HidePanelController
      onCollapsepanel={(isHidden: boolean) => this.collapsePanel(isHidden)}
    />
    const empty = <div></div>

    const elements: Record <StateBarElements, VNode> = {
      joinreq,
      devices,
      camera,
      mic,
      increase,
      amount,
      fee,
      stream,
      empty,
      hide
    }

    return <div class='state-bar'>
      <div class={this.panelStyle} ref={'statebar'}>
        {
          this.barElements 
            ? this.barElements.map((item, index) => {
              return <div 
                class={index === this.barElements.length - 1 ? 'state-bar__control' : this.controlStyle}>
                  { elements[item] || null } 
              </div>
            })
            : null
        }
      </div>
      <div class='state-bar__info'>
        { live }
      </div>
    </div>
  }
})
