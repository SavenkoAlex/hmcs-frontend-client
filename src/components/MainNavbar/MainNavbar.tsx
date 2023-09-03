import {
  defineComponent,
  VNode
} from 'vue'

import Icon from '@/components/SvgIcon/Icon'

import './MainNavbar.scss'

export default defineComponent({

  name: 'App',

  components: {
    Icon
  },

  data () {
    return {
    }
  },

  render(): VNode {
    return <div class={'col-12 col-s-12 navbar'}>
      <div class={'col-4 col-s-4'}>
        <Icon
          iconName={'logo'}
        />
      </div>
    </div>
  }
})
