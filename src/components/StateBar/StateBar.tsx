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
  UserAccount
} from '@/global/global'

import { Data } from '@/components/StateBar/types'

import { BarConfiguration, BarConfigutations, StateBarElements } from '@/components/StateBar/types'

/** components */
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import IconButton from '@/components/general/Buttons/IconButton/IconButton'
import LiveIndicator from '@/components/LiveIndicator/LiveIndicator'
import Label from '@/components/general/Label/Label'
import CameraController from '@/components/CameraController/CameraController'

/** icons */
import PlayIcon from '@/assets/images/play_32.svg'
import StopIcon from '@/assets/images/stop_32.svg'
import CameraIcon from '@/assets/images/camera_32.svg'
import AddCallIcon from '@/assets/images/person_32.svg'
import CoinIcon from '@/assets/images/currency_ruble_24dp_FILL0_wght400_GRAD0_opsz24.svg'

export default defineComponent({

  name: 'StateBar',

  components: {
    TextButton,
    IconButton,
    PlayIcon,
    StopIcon,
    CameraIcon,
    AddCallIcon,
    CoinIcon,
    CameraController
  },

  props: {
    
    userRole: {
      type: String as PropType <Exclude<UserRole, UserRole.ANONYMOUS>>,
      required: true,
    },

    streamAvailable: {
      type: Boolean as PropType <boolean>,
      default: false
    }
  },

  emits: ['streamtoggle'],

  computed: {
    barElements () {
      return BarConfigutations[this.userRole] || null
    },

    streamButtonText () {
      return this.isStreamAvailable
        ? this.$t('pages.stateBar.stopStream')
        : this.$t('pages.stateBar.startStream')
    }
  },

  data (): Data {
    return {
      userAccountId: null,
      userId: null,
      live: false,
      isStreamAvailable: true,
      isRequestActive: false,
      user: null,
      account: null,
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
    const camera = <CameraController/>
    const increase = <div class='state-bar__increase'></div>
    const amount = null ?? <div class='state-bar__amount'>
      <div class='state-bar__amount_count'>
        <span> { this.account?.amount  || 0} </span>
      </div>
      <div class='state-bar__amount_currency'>
        <CoinIcon/>
      </div>

    </div>
    const fee = <div class='state-bar_fee'></div>

    const stream = <div class='state-bar__stream'>
      <IconButton 
        mode={this.isStreamAvailable? 'active' : 'fourth'}
        //onClick={() => this.$emit('streamtoggle', this.isStreamAvailable)}  
        onClick={() => this.isStreamAvailable = !this.isStreamAvailable}
        disabled={!this.streamAvailable}
      >
        { this.isStreamAvailable ?  <PlayIcon/> : <StopIcon/> }
      </IconButton>
    </div>

    const elements: Record <StateBarElements, VNode> = {
      live,
      joinreq,
      camera,
      increase,
      amount,
      fee,
      stream
    }

    return <div class='state-bar'>
      {
        this.barElements ? this.barElements.map((item) => elements[item] || null) : null
      }  
    </div>
  }
})
