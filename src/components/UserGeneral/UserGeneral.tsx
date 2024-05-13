import {
  defineComponent,
  PropType,
  VNode
} from 'vue'

/** types */
import { User } from '@/global/global'

export default defineComponent({

  name: 'UserGeneral',

  props: {
    user: {
      type: Object as PropType <User>
    }
  },

  data() {
    return {
      userData: {}
    }
  },
  
  render (): VNode {
    return <div class='user-general'>

      <div class='user-general__count'>
        <span> 0 </span>
        <span><html>U+20BD</html></span>
      </div>
    </div>
  }
})
