import {
  defineComponent,
  VNode
} from 'vue'

/** components */
import RegisterForm from '@/components/RegisterForm/RegisterForm'

/** style */
import '@/pages/Registration/Registration.scss'

export default defineComponent ({

  name: 'AuthorizationPage',

  components: {
    RegisterForm
  },

  render(): VNode { 
    return <div class='register'>
      <RegisterForm/>
    </div>
  }
})
