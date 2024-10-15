import {
  defineComponent,
  VNode
} from 'vue'

/** components */
import LoginForm from '@/components/LoginForm/LoginForm'
import Label from '@/components/general/Label/Label'

/** styles */
import '@/pages/Login/Login.scss'

export default defineComponent({

  name: 'LoginPage',

  components: {
    LoginForm
  },

  render(): VNode {
    return <div class='login'>
      <LoginForm/>
    </div>
  }
})
