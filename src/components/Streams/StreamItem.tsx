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
import LiveIndicator from '@/components/LiveIndicator/LiveIndicator'
import { Button, Avatar } from 'primevue' 

/** icons */
import CardsPic from '@/assets/images/small/error_16dp.svg'

export default defineComponent({

  name: 'StreamItem',

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
        id: this.stream.streamId,
        
      }})
    }
  },

  render (): VNode {
    return <div  class='streamer-item'>
      <div class='streamer-item__avatar'>
        <Avatar image={this.stream.avatar || 'src/assets/images/small/error_16dp.svg'} size='xlarge' shape='circle' />
      </div>
        <div class='streamer-item__header'>
          {[
              <LiveIndicator live={this.online}/>,
              <h5>{ this.stream.username || 'some streamer' }</h5>
          ]}
        </div>

        <Button
          label={this.$t('common.join')}
          onClick={() => this.onJoin()}
          variant='secondary'
          raised
          size='small'
        />
    </div>
  }
})
