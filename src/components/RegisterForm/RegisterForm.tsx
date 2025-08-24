import {
  defineComponent,
  VNode,
} from 'vue'

/** components */
import Form from '@/components/general/Form/Form'
import Loader from '@/components/general/Loader/Loader'
import { Checkbox, InputText, Button } from 'primevue'

/** styles */
import '@/components/RegisterForm/RegisterForm.scss'

/** helper */
import { emptyfieldValidation } from '@/helpers/helper'

/** types */
import { SidePosition, UserRole } from '@/types/global'
import { register } from '@/api/login'
import { useToast } from '@/services/toast/toast'

/** toast */

export default defineComponent({

  name: 'RegisterForm',

  components: {
    InputText,
    Button,
    Form,
    Checkbox,
    Loader
  },

  computed: {
    isPasswordMatch () {
      return (this.password === this.passwordCheck) && this.password.length !== 0 && this.passwordCheck.length !== 0
    }
  },

  setup () {
    const toast = useToast()

    return {
      toast
    }
  },

  data () {
    return {
      login: '',
      password: '',
      username: '',
      passwordCheck: '',
      isPublisher: false,
      isLoading: false
    }
  },

  methods: {
    async register () {
      if (!this.login || !this.username) {
        // show notification
        return 
      }
      this.isLoading = true
      const result = await register({
        username: this.username,
        login: this.login,
        password: this.password,
        role: this.isPublisher ? UserRole.WORKER : UserRole.USER
      })

      this.isLoading = false
      
      if (!result) {
        this.toast.error(this.$t('pages.registerForm.errors.register'))
        return
      }

      this.$router.push('login')
    }
  },

  render (): VNode {
    const formHeader = <div class='login-form__header'>
      <h2> { this.$t('pages.registerForm.title') } </h2>
    </div>

    const formBody = <div class='register-form__body'>
      <div class='register-form__input'>
        <InputText
          placeholder={this.$t('pages.registerForm.username')}
          modelValue={this.username}
          pt={{
            root: {
              style: {
                width: '100%'
              }
            } 
          }}
        />
      </div>
      <div class='register-form__input'>
        <InputText
          placeholder={this.$t('pages.registerForm.login')}
          modelValue={this.login}
          pt={{
            root: {
              style: {
                width: '100%'
              }
            } 
          }}
        />
      </div>
      <div class='register-form__input'>
        <InputText
          placeholder={this.$t('pages.registerForm.password')}
          type={'password'}
          modelValue={this.password}
          pt={{
            root: {
              style: {
                width: '100%'
              }
            } 
          }}
        />
      </div>
      <div class='register-form__input'>
        <InputText
          placeholder={this.$t('pages.registerForm.password')}
          type={'password'}
          modelValue={this.passwordCheck}
          pt={{
            root: {
              style: {
                width: '100%'
              }
            } 
          }}
        />
      </div> 

      <div class='register-form__input'>
        <label for={'isPublisher'}>
          { this.$t('pages.registerForm.isPublisher') }
        </label>

        <Checkbox
          inputId='isPublisher'
          value={this.isPublisher}
        />
      </div> 
    </div>

    const formFooter = <div class='register-form__footer'>
      <div class='register-page__submit-button'>
        <Button
          label={this.$t('pages.registerForm.submit')}
          onClick={this.register}
          pt={{
            root: {
              style: {
                width: '100%'
              }
            }
          }}
        />
      </div>
    </div>

    return <div class='register-form'>
      {
        <Loader
          isVisible={this.isLoading}
        />
      }
      <Form
        
      >
        {{
          header: () => formHeader,
          default: () => formBody,
          footer: () => formFooter
        }}
      </Form>
    </div>
  }
})
