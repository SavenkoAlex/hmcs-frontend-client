import {
  defineComponent,
  VNode
} from 'vue'

/** components */
import TextInput from '@/components/general/inputs/TextInput/TextInput'
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import Form from '@/components/general/Form/Form'
import Notifier from '@/components/Notifier/Notifier'
import Button from 'primevue/button'
import { InputText, Toast } from 'primevue'

/** styles */
import '@/components/LoginForm/LoginForm.scss'
import { $dt } from '@primeuix/themes'

/** types */
import { Data } from '@/components/LoginForm/Types'
import { States } from '@/types/store'

/** api */
import { authentificate } from '@/api/login'
import accountApi from '@/api/account'

/** store */
import { mapActions, mapGetters } from 'vuex'
import { UserRole } from '@/types/global'
import { RouterLink } from 'vue-router'

/** notifier */
import { useToast } from '@/services/toast/toast'

/** validation */
import { emptyfieldValidation } from '@/helpers/helper'
import { mode } from 'crypto-js'

export default defineComponent({

  name: 'LoginForm',

  components: {
    TextButton,
    TextInput,
    Form,
    Notifier,
  },

  data (): Data {
    return {
      login: '',
      password: '',
      loginStatus: null,
    }
  },

  setup () {
    const toast = useToast()

    return {
      toast
    }
  },

  computed:  {
    ...mapGetters({
      userRole: 'user/userRole'
    })
  },

  methods: {
    ...mapActions(States.USER, ['setUserProperty', 'setUser', 'setAmount']),

    async getAccountBill (userId: string): Promise <boolean> {
      if (!userId) {
        return false
      }
      const response = await  accountApi.getAccount(userId)

      if (!response || !Number.isFinite(response.amount)) {
        this.toast.error(this.$t('pages.loginForm.errors.login'))
        return false
      }

      this.setAmount(response.amount)
      return true
    },

    async authorize () {
      const response = await authentificate(this.login, this.password)

      if (!response) {
        this.setUserProperty({isAuthentificated: false})
        this.toast.error(this.$t('pages.loginForm.errors.login'))
        return
      }

      const { user, accessToken } = response

      if (!user || !user.id || !user.login || !user.role || !user.role || !user.username || !accessToken) {
        this.toast.error(this.$t('pages.loginForm.errors.login'))
        return
      }

      localStorage.setItem('accessToken', accessToken)

      const isAmountSet = await this.getAccountBill(user.id)

      if (!isAmountSet) {
        this.toast.error(this.$t('pages.loginForm.errors.login'))
        // TODO: clear access localstorage
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

      <RouterLink to='registration'> 
        {{
          default: ({navigate}: {navigate: () => void}) => <Button 
            variant='text'
            link
            label={this.$t('pages.loginForm.register')}
            size={'small'}
            onClick={navigate}
            dt={{
              sm: {
                padding: {
                  x: 0,
                  y: 0
                }
              },
              link: {
                color: `${$dt('slate.600').variable}`
              }
            }}
          />
        }}
      </RouterLink>
    </div>

    const formBody = <div class='login-form__body'>
      <div class='login-form__input'>
        <InputText
          autofocus={true}
          placeholder={this.$t('pages.loginForm.login')}
          modelValue={this.login}
          // @ts-ignore
          onUpdate:modelValue={(value) => this.login = value}
          required
        />
      </div>
      <div class='login-form__input'>
        <InputText
          placeholder={this.$t('pages.loginForm.password')}
          modelValue={this.password}
          // @ts-ignore
          onUpdate:modelValue={(value) => this.password = value}
          type={'password'}
          required
        />
      </div> 
    </div>

    const formFooter = <div class='login-form__footer'>
      <div class='loogin-page__submit-button'>
        <Button 
          label={this.$t('pages.loginForm.submit')}
          onClick={() => this.loginAndRedirect()}
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
