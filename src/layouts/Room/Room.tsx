import {
  defineComponent,
  VNode
} from 'vue'

/** styles */
import '@/layouts/Room/Room.scss'

export default defineComponent({

  name: 'RoomLayout',

  render (): VNode {
    return <div class='room'>
      <div class='room__media'>
        { this.$slots.media?.() }
      </div>
      <div class='room__controls'>
        { this.$slots.controls?.() }
      </div>
        <div class='room__chat'>
        { this.$slots.chat?.() }
      </div> 
    </div>
  }
})
