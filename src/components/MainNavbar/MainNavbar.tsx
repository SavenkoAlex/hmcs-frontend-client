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
      isAuthenticated: localStorage.getItem('isAuthenticated')
    }
  },  

  render(): VNode {

    return <div class={'row'}>
      <div class={'col-12 col-s-12 navbar'}>
        <div class={'col-4 col-s-4 navbar__logo'}>
          <LogoIcon/>
        </div>
        <div class={'col-8 col-s-8 navbar__menu'}>
            <ul>
              <li>
                <div class="navbar__option">
                  <RouterLink to={'/streams'}> {'Streams' } </RouterLink>
                </div>
              </li>
              <li>
                <div class={this.isAuthenticated !== 'null' ? 'navbar__option_visible' : 'navbar__option_hidden' }>
                  <RouterLink to={'/user'}> { 'User' } </RouterLink>
                </div>
              </li>
            </ul>
        </div>
      </div>
    </div>
  }
})
