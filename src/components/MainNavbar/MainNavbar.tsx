import {
  defineComponent,
  VNode,
  ref,
  computed,
  provide
} from 'vue'

/** Style */
import './MainNavbar.scss'

/** components */
import LogoIcon from '@/assets/images/logo48.svg'
import { RouterLink } from 'vue-router'

/** store */
import { useStore } from '@/store'

/** types */
import { UserRole, Maybe, JanusPlugin } from '@/types/global'
import { States } from '@/types/store'
import { userLinks } from '@/router/types'
import { mapGetters } from 'vuex'
import { Data } from '@/components/MainNavbar/types'

/** webrtc handler */
import Janus, { JanusJS } from 'janus-gateway'
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'

export default defineComponent({

  name: 'MainNavbar',

  setup () {},
  data (): Data {
    return {
      links: userLinks[UserRole.ANONYMOUS]
    }
  },

  computed: {
    ...mapGetters(States.USER, {
      userRole: 'userRole', 
      isAuthentificated: 'isAuthentificated'
    }),
  },

  watch: {
    userRole: {
      handler: function (newValue: UserRole) {
        this.links = this.getLinks(newValue)
      },
      immediate: true
    }
  },

  methods: {

    getLinks (role: UserRole) {

      if (!role || !this.isAuthentificated) {
        return userLinks[UserRole.ANONYMOUS]
      }

      if (role === UserRole.USER) {
        return userLinks[UserRole.USER]
      }

      if (role === UserRole.WORKER) {
        return userLinks[UserRole.WORKER]
      }

      return userLinks[UserRole.ANONYMOUS]
    }
  },

  render(): VNode {

    const navbar = <ul>
      {
        this.links.map(item => {
        return <li>
          <div class='navbar__option_visible'>
            <RouterLink to={`/${item}`}> { this.$t(`routes.${item}`) } </RouterLink>
          </div>
          </li>
        })
      }
    </ul>

    return <div class={'navbar'}>
        <div class={'navbar__logo'}>
          <LogoIcon/>
        </div>
        <div class={'navbar__menu'}>
          { navbar }
        </div>
      </div>
  }
})
