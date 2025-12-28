import {
  defineComponent,
  VNode,
  TransitionGroup
} from 'vue'

/** Style */
import './MainNavbar.scss'

/** components */
import LogoIcon from '@/assets/images/logo.svg'
import { RouterLink } from 'vue-router'
import { Menubar } from 'primevue'

/** types */
import { UserRole } from '@/types/global'
import { States } from '@/types/store'
import { userLinks } from '@/router/types'
import { mapGetters } from 'vuex'
import { Data, MenuItem } from '@/components/MainNavbar/types'


export default defineComponent({

  name: 'MainNavbar',

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

    menuItems (): MenuItem[] {
      const links = this.links.map(item => {
        return {
          label: this.$t(`routes.${item}`),
          to: `/${item}`
        }
      })

      const logo = {
        label: 'AuraLive',
        to: '/'
      }

      return [logo, ...links]
    }
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
    const navbar = <TransitionGroup name="navbar">
      <Menubar
        model={this.menuItems}
        breakpoint='sm'
        pt={{
          item: {
            class: 'menu__item'
          },
          rootList: {
            class: 'menu__container'
          },
          root: {
            class: 'menu',
          }
        }}
        key="menubar"
      >
        {{
          item: (item: { item: MenuItem } ) => {
            return <RouterLink to={item?.item?.to} custom>
            {{
              default: ({ navigate }: {href: string, navigate: () => void}) => <span
                onClick={navigate}
              >
                  { item.item?.label}
                </span>
            }}
            </RouterLink>
          }
        }}
      </Menubar>
    </TransitionGroup>

    return <div class={'navbar'}>
      { navbar }
    </div>
  }
})
