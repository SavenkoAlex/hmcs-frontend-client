import {
  defineComponent,
  VNode
} from 'vue'

/** Style */
import './MainNavbar.scss'

/** Components */
import LogoIcon from '@/assets/images/logo48.svg'

import { RouterLink } from 'vue-router'

export default defineComponent({

  name: 'MainNavbar',

  data () {
    return {
      isAuthenticated: false
    }
  },  

  render(): VNode {

    return <div class={'navbar'}>
        <div class={'navbar__logo'}>
          <LogoIcon/>
        </div>
        <div class={'navbar__menu'}>
            <ul>
              <li>
                <div class="navbar__option">
                  <RouterLink to={'/streams'}> {'Streams' } </RouterLink>
                </div>
              </li>
              <li>
                <div class={this.isAuthenticated ? 'navbar__option_visible' : 'navbar__option_hidden' }>
                  <RouterLink to={'/user'}> { 'User' } </RouterLink>
                </div>
              </li>
              <li>
                <div class={this.isAuthenticated ? 'navbar__option_hidden': 'navbar__option_visible'  }>
                  <RouterLink to={'/auth'}> { 'Auth' } </RouterLink>
                </div>
              </li>
            </ul>
        </div>
      </div>
  }
})
