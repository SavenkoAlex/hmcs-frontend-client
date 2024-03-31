import {
  defineComponent,
  VNode
} from 'vue'

/** Style */
import './MainNavbar.scss'

/** Components */
import LogoIcon from '@/assets/images/logo48.svg'
import { RouterLink } from 'vue-router'

/** store */
import { mapGetters } from 'vuex'

/** types */
import { UserRole } from '@/global/global'

export default defineComponent({

  name: 'MainNavbar',

  computed: {
    ...mapGetters({
      userType: 'user/userType',
      isAuthentificated: 'user/isAuthentificated'
    }),
  },
  
  render(): VNode {

    const userNavbar = <ul>
      <li>
        <div class={this.isAuthentificated ? 'navbar__option_visible' : 'navbar__option_hidden' }>
          <RouterLink to={'user'}> { this.$t('routes.user') } </RouterLink>
        </div>
      </li>
      <li>
        <div class="navbar__option">
          <RouterLink to={'streams'}> { this.$t('routes.streams') } </RouterLink>
        </div>
      </li>
      <li>
        <div class={this.isAuthentificated ? 'navbar__option_hidden': 'navbar__option_visible'  }>
          <RouterLink to={'auth'}> { this.$t('routes.auth') } </RouterLink>
        </div>
      </li>
    </ul>

    const workerNavbar = <ul>
      <li>
        <div class="navbar__option">
          <RouterLink to={'stream'}> { this.$t('routes.stream') } </RouterLink>
        </div>
      </li>
      <li>
        <div class={this.isAuthentificated ? 'navbar__option_visible' : 'navbar__option_hidden' }>
          <RouterLink to={'user'}> { this.$t('routes.user') } </RouterLink>
        </div>
      </li>
      <li>
        <div class={this.isAuthentificated ? 'navbar__option_hidden': 'navbar__option_visible'  }>
          <RouterLink to={'auth'}> { this.$t('routes.auth') } </RouterLink>
        </div>
      </li>
    </ul>

    const anonymousNavbar = <ul>
      <li>
        <div class={this.isAuthentificated ? 'navbar__option_hidden': 'navbar__option_visible'  }>
          <RouterLink to={'/auth'}> { this.$t('routes.auth') } </RouterLink>
        </div>
      </li>
      <li>
        <div class="navbar__option">
          <RouterLink to={'/streams'}> { this.$t('routes.streams') } </RouterLink>
        </div>
      </li>
    </ul>

    const menu = this.userType === UserRole.USER 
      ? userNavbar
      : this.userType === UserRole.WORKER
        ? workerNavbar
        : anonymousNavbar

    return <div class={'navbar'}>
        <div class={'navbar__logo'}>
          <LogoIcon/>
        </div>
        <div class={'navbar__menu'}>
          { menu }
        </div>
      </div>
  }
})
