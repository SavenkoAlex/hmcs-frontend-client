import {
  defineComponent,
  VNode
} from 'vue'

/** components */
import TextInput from '@/components/general/inputs/TextInput/TextInput'
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import Form from '@/components/general/Form/Form'
import Notifier from '@/components/Notifier/Notifier'

/** styles */
import '@/components/LoginForm/LoginForm.scss'

/** helper */
import { emptyfieldValidation } from '@/helpers/helper'

/** types */
import { Data } from '@/components/LoginForm/Types'

export default defineComponent({

  name: 'LoginForm',

  components: {
    TextButton,
    TextInput,
    Form,
    Notifier
  },

  data (): Data {
    return {
      login: '',
      password: '',
      loginStatus: null,
    }
  },

  methods: {
    login () {
      this.loginStatus = {
        message: this.$t('pages.loginForm.success'),
        success: true
      }
    }
  },

  render (): VNode {
    const formHeader = <div class='login-form__header'>
      <h4> { this.$t('pages.loginForm.title') } </h4>
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
        />
      </div> 
    </div>

    const formFooter = <div class='login-form__footer'>
      <div class='loogin-page__submit-button'>
        <TextButton 
          text={this.$t('pages.loginForm.submit')}
          onClick={() => this.login()}
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
