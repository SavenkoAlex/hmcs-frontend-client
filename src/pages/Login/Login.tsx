import { defineComponent, VNode } from 'vue'

/** types */
import { Data } from '@/pages/Login/Type'

/** style */
import '@/pages/Login/Login.scss'

/** components */
import LoginForm from '@/components/LoginForm/LoginForm'
import RegisterForm from '@/components/RegisterForm/RegisterForm'

export default defineComponent({
  
  name: 'LoginPage',

  components: {
    LoginForm,
    RegisterForm
  },

  data (): Data {
    return {
      activeForm: 'login'
    }
  },

  methods: {
    toggle (formName: 'login' | 'register') {
      this.activeForm = formName || 'login' 
    }
  },

  render (): VNode {
    return <div class='login-page'>
      <div class='form-switcher'>
        <a onClick={() => this.toggle('login')}>{this.$t('pages.loginForm.login')}</a>
        <span> | </span>
        <a onClick={() => this.toggle('register')}>{this.$t('pages.loginForm.register')}</a>
      </div>
      {  this.activeForm === 'login' ? <LoginForm/> : <RegisterForm/> }
    </div>
  }
})
