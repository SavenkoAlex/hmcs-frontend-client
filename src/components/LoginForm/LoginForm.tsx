import {
  defineComponent,
  VNode
} from 'vue'

/** components */
import TextInput from '@/components/general/inputs/TextInput/TextInput'
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import Form from '@/components/general/Form/Form'
import Notifier from '@/components/Notifier/Notifier'
import Link from '@/components/general/Link/Link' 

/** styles */
import '@/components/LoginForm/LoginForm.scss'

/** helper */
import { emptyfieldValidation } from '@/helpers/helper'

/** types */
import { Data } from '@/components/LoginForm/Types'
import { States } from '@/types/store'

/** api */
import { authentificate } from '@/api/login'

/** store */
import { mapActions, mapGetters } from 'vuex'
import { userStateKey } from '@/store'
import { UserRole } from '@/types/global'
import Label from '../general/Label/Label'
import { RouterLink } from 'vue-router'

export default defineComponent({

  name: 'LoginForm',

  components: {
    TextButton,
    TextInput,
    Form,
    Notifier,
    Link
  },

  data (): Data {
    return {
      login: '',
      password: '',
      loginStatus: null,
    }
  },

  computed:  {
    ...mapGetters({
      userRole: 'user/userRole'
    })
  },

  methods: {
    ...mapActions(States.USER, ['setUserProperty', 'setUser']),

    async authorize () {
      const response = await authentificate(this.login, this.password)

      if (!response) {
        this.setUserProperty({isAuthentificated: false})
        return
      }

      const { user } = response

      if (!user || !user.id || !user.login || !user.role || !user.role || !user.username) {
        return
      }

      this.setUserProperty({ isAuthentificated: true})
      this.setUser(user)
      
    },

    async loginAndRedirect () {
      try {
        await this.authorize()
      } catch (error) {
        console.error(error)
      }

      this.userRole == UserRole.WORKER
        ? this.$router.push('stream')
        : this.$router.push('streams')
    }
  },

  render (): VNode {
    const formHeader = <div class='login-form__header'>
      <h2> { this.$t('pages.loginForm.title') } </h2>
        <Link>
          <RouterLink to='registration'> { this.$t('pages.loginForm.register') } </RouterLink>
        </Link>
    </div>

    const formBody = <div class='login-form__body'>
      <div class='login-form__input'>
        <TextInput
          label={{
            text: this.$t('pages.loginForm.login')
          }}
          placeholder={this.$t('pages.loginForm.login')}
          modelValue={this.login}
          onUpdate:modelValue={(event) => this.login = event}
          validators={[emptyfieldValidation]}       
          isRequired
        />
      </div>
      <div class='login-form__input'>
        <TextInput
          label={{
            text: this.$t('pages.loginForm.password')
          }}
          placeholder={this.$t('pages.loginForm.password')}
          type={'password'}
          modelValue={this.password}
          onUpdate:modelValue={(event) => this.password = event}
          validators={[emptyfieldValidation]}       
          isRequired
        />
      </div> 
    </div>

    const formFooter = <div class='login-form__footer'>
      <div class='loogin-page__submit-button'>
        <TextButton 
          text={this.$t('pages.loginForm.submit')}
          onClick={() => this.loginAndRedirect()}
        />
      </div>
    </div>

    return <div class='login-form'>
        {
          this.loginStatus && <Notifier
            message={this.loginStatus.message}
            messageType={this.loginStatus.success ? 'success' : 'error'}
          />
        }
        <Form>
          {{
            header: () => formHeader,
            default: () => formBody,
            footer: () => formFooter
          }}
      </Form>
    </div>
  }
})
