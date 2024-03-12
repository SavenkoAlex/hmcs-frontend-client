import {
  defineComponent,
  VNode,
} from 'vue'

/** components */
import TextInput from '@/components/general/inputs/TextInput/TextInput'
import Checkbox from '@/components/general/inputs/Checkbox/Checkbox'
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import Form from '@/components/general/Form/Form'

/** styles */
import '@/components/RegisterForm/RegisterForm.scss'

/** helper */
import { emptyfieldValidation } from '@/helpers/helper'

export default defineComponent({

  name: 'LoginForm',

  components: {
    TextButton,
    TextInput,
    Form,
    Checkbox
  },

  data () {
    return {
      login: '',
      password: '',
      username: '',
      passwordCheck: '',
      isPublisher: false
    }
  },


  render (): VNode {
    const formHeader = <div class='login-form__header'>
      <h4> { this.$t('pages.registerForm.title') } </h4>
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
          modelValue={this.password}
          onUpdate:modelValue={(event) => this.passwordCheck = event}
          validators={[emptyfieldValidation]}       
        />
      </div> 

      <div class='register-form__input'>
        <Checkbox
          label={{
            text: this.$t('pages.registerForm.isPublisher')}
          }
          modelValue={this.isPublisher}
          onUpdate:modelValue={(value) => this.isPublisher = value}
        />
      </div> 
    </div>

    const formFooter = <div class='register-form__footer'>
      <div class='register-page__submit-button'>
        <TextButton text={this.$t('pages.registerForm.submit')}/>
      </div>
    </div>

    return <div class='register-form'>
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
