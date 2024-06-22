import {
  defineComponent,
  VNode,
  PropType
} from 'vue'

/** types */
import { User } from '@/types/global'

/** style */
import '@/components/Streams/StreamItem.scss'

/** component */
import Label from '@/components/general/Label/Label'
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import LiveIndicator from '@/components/LiveIndicator/LiveIndicator'

export default defineComponent({

  name: 'StreamItem',

  components: {
    Label,
    TextButton
  },

  props: {
    stream: {
      type: Object as PropType <User>,
      required: true
    },
    online: {
      type: Boolean as PropType <boolean>,
      default: false
    }
  },

  computed: {
    avatar (): string | null {
      if (!this.stream?.avatar) {
        return null
      }
      const representation = this.stream.avatar

      return this.stream.avatar
        ? `data:image/jpg;base64,${representation}`
        : null
    }
  },

  methods: {
    onJoin() {
      this.$router.push({ name: 'publisher', params: { 
        id: this.stream.id, 
      }})
    }
  },

  render (): VNode {
    return <div  class='streamer-item'>
      <div class='streamer-item__description'>
        
        <div class='streamer-item__description_header'>
          {
            [
              <div class='streamer-item__indicator'>
                <LiveIndicator live={this.online} />
              </div>,
              <h3>{ this.stream.username || 'some streamer' }</h3>
            ]
          }
        </div>

        <Label text={'some stream description'} />

        <TextButton 
          text={this.$t('common.join')}
          onClick={() => this.onJoin()}
        />
      </div>

      <div class='streamer-item__avatar'>
        {
          this.avatar && <img src={this.avatar} class='streamer-item__avatar_img'/>
        }
      </div>
    </div>
  }
})
