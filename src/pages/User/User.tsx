import {
  defineComponent,
  VNode,
} from 'vue'

/** styles */
import './User.scss'

/** types */
import { Data } from './types'
import { UserRole, ElementScale } from '@/types/global'
import { States } from '@/types/store'

/** components */
import UserProfile from '@/components/Profile/UserProfile'
import WorkerProfile from '@/components/Profile/WorkerProfile'
import Label from '@/components/general/Label/Label'

/** vuex */
import { mapGetters } from 'vuex'
export default defineComponent({

  name: 'UserPage',

  components: {
    UserProfile,
    WorkerProfile,
    Label
  },

  computed: {
    ...mapGetters(States.USER, {
      userRole: 'userType',
      userId: 'userId'
    })
  },

  data (): Data {
    return {
      userRole: UserRole.USER
    }
  },

  methods: {
    async getUser() {}
  },

  created() {
    console.log('created')
  },

  render (): VNode {
    return <div class='user-profile__container'>
      { 
        this.userRole === UserRole.USER
          ? <UserProfile
            userId={this.userId}
          />
          : this.userRole === UserRole.WORKER
            ? <WorkerProfile
              userId={this.userId}
            />
            : <div class={'user-profile__container_empty'}>
              <Label
                scale={ElementScale.LARGER}
                text={this.$t('pages.profile.userProfileEmpty')}
              ></Label>
            </div>
      }
    </div>
  }
})

