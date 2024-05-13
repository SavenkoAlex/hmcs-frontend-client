import {
  defineComponent,
  VNode,
} from 'vue'

/** styles */
import './User.scss'

/** types */
import { Data } from './types'
import { UserRole } from '@/global/global'

/** components */
import UserGeneral from '@/components/UserGeneral/UserGeneral'

export default defineComponent({

  name: 'UserPage',

  components: {
    UserGeneral
  },

  data (): Data {
    return {
      userRole: UserRole.USER
    }
  },

  methods: {
    async getUser() {}
  },

  render (): VNode {
    return <div>

      <UserGeneral>

      </UserGeneral>
    </div>
  }
})

