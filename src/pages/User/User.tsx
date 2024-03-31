import {
  defineComponent,
  VNode,
} from 'vue'

/** styles */
import './User.scss'

/** types */
import { Data } from './types'
import { UserRole } from '@/global/global'

export default defineComponent({

  name: 'UserPage',

  data (): Data {
    return {
      userRole: UserRole.USER
    }
  },

  render (): VNode {
    return <div>

    </div>
  }

})

