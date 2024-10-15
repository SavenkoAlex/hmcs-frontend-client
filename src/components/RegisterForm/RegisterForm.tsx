import {
  defineComponent,
  VNode,
} from 'vue'

/** components */
import TextInput from '@/components/general/inputs/TextInput/TextInput'
import Checkbox from '@/components/general/inputs/Checkbox/Checkbox'
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import Form from '@/components/general/Form/Form'
import Loader from '@/components/general/Loader/Loader'

/** styles */
import '@/components/RegisterForm/RegisterForm.scss'

/** helper */
import { emptyfieldValidation } from '@/helpers/helper'

/** types */
import { SidePosition, UserRole } from '@/types/global'
import { register } from '@/api/login'
import { useToast } from 'vue-toastification'

/** toast */

export default defineComponent({

  name: 'RegisterForm',

  components: {
    TextButton,
    TextInput,
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
        <TextInput
          label={{
            text: this.$t('pages.registerForm.username')
          }}
          placeholder={this.$t('pages.registerForm.username')}
          modelValue={this.username}
          onUpdate:modelValue={(event) => this.username = event}
          validators={[emptyfieldValidation]}       
        />
      </div>
      <div class='register-form__input'>
        <TextInput
          label={{
            text: this.$t('pages.registerForm.login')
          }}
          placeholder={this.$t('pages.registerForm.login')}
          modelValue={this.login}
          onUpdate:modelValue={(event) => this.login = event}
          validators={[emptyfieldValidation]}       
        />
      </div>
      <div class='register-form__input'>
        <TextInput
          label={{
            text: this.$t('pages.registerForm.password')
          }}
          placeholder={this.$t('pages.registerForm.password')}
          type={'password'}
          modelValue={this.password}
          onUpdate:modelValue={(event) => this.password = event}
          validators={[emptyfieldValidation]}       
        />
      </div>
      <div class='register-form__input'>
        <TextInput
          label={{
            text: this.$t('pages.registerForm.repeatPassword')
          }}
          placeholder={this.$t('pages.registerForm.password')}
          type={'password'}
          modelValue={this.passwordCheck}
          onUpdate:modelValue={(event) => this.passwordCheck = event}
          validators={[emptyfieldValidation]}       
        />
      </div> 

      <div class='register-form__input'>
        <Checkbox
          label={{
            text: this.$t('pages.registerForm.isPublisher')}
          }
          labelPosition={SidePosition.RIGHT}
          modelValue={this.isPublisher}
          onUpdate:modelValue={(value) => this.isPublisher = value}
        />
      </div> 
    </div>

    const formFooter = <div class='register-form__footer'>
      <div class='register-page__submit-button'>
        <TextButton 
          text={this.$t('pages.registerForm.submit')}
          onClick={this.register}
        />
      </div>
    </div>

    return <div class='register-form'>
      {
        this.isLoading ? <Loader/> :  null 
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
