import {
  defineComponent,
  PropType,
  VNode
} from 'vue'

/** types */
import { ElementScale } from '@/types/global'
import { Style } from '@/components/AccountIndicator/types'

/** components */
import CoinIcon from '@/assets/images/toll_24.svg'

/** styles */
import '@/components/AccountIndicator/AccountIndicator.scss'

export default defineComponent({

  name: 'AccountIndicator',

  props: {
    amount: {
      type: Number as PropType <number>,
      default: 0
    },

    mode: {
      type: String as PropType <ElementScale>,
      default: ElementScale.MEDIUM
    }
  },

  computed: {
    style (): Style {

      switch (this.mode) {
        case ElementScale.LARGE:
          return {
            'font-weight': 600,
            "font-style": 'inherit',
            "font-display": 'fallback',
            "letter-spacing": '-.12px',
            'font-size': '60px',
            'line-height': '28px'
          }
        case ElementScale.SMALL: 
          return {
            'font-weight': 200,
            "font-style": 'inherit',
            "font-display": 'fallback',
            "letter-spacing": '-.32px',
            'font-size': '36px',
            'line-height': '22px'
          }

        default:
          return {
            'font-weight': 400,
            "font-style": 'inherit',
            "font-display": 'fallback',
            "letter-spacing": '-.24px',
            'font-size': '48px',
            'line-height': '56px'
          }
      }
    }

  },
  render (): VNode {
    return <div class='account-indicator'>
      <div class='account-indicator__amount' style={this.style}>
        { this.amount }
      </div> 
      <div class='account-indicator__icon'>
        <v-html> &#8381; </v-html>
      </div>
    </div>
  }
})
