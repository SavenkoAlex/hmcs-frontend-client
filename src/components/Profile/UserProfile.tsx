import {
  defineComponent,
  PropType,
  VNode,
  inject,
  h
} from 'vue'

/** types */
import { User, chatKey, publisherHandlerKey, subscriberHandlerKey} from '@/types/global'
import { UserDataProfile, MIN_AMOUNT } from '@/components/Profile/types'
import { States } from '@/types/store'
import { ChatHandler } from '@/services/webrtc/webrtcDataExchange'
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'
import { PublisherStreamHandler } from '@/services/webrtc/webrtcPublisher'

/** api */
import userApi from '@/api/user'

/** components */
import { Card, Button, Avatar, InputText, SplitButton }  from 'primevue'

/** icons */
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiPencil, mdiPlus } from '@mdi/js';

/** styles */
import '@/components/Profile/Profile.scss'

/** vuex */
import { mapActions, mapGetters } from 'vuex'

/** types */
import { UserRole } from '@/types/global'

export default defineComponent({

  name: 'UserProfile',

  emits: {
    logout: (): void => {
      return
    }
  },

  components: {
    Card
  },

  props: {
    userId: {
      type: String as PropType <string | null>,
      default: null
    }
  },

  watch: {

  },

  computed: {
    ...mapGetters(States.USER, [ 'userAmount' ]),

    avatarSrc () {
      if (!this.userData?.avatar) {
        return
      }

      const representation = this.userData.avatar

      return `data:image/jpg;base64,${representation}`
    },

  },

  data(): UserDataProfile {
    return {
      userData: {
        username: '',
        login: '',
        role: UserRole.ANONYMOUS,
        id: '',
        streamId: 0,
        avatar: ''
      },
      repeatPassword: '',
      newPassword: '',
      penIconPath: mdiPencil,
      plusIcon: mdiPlus
    }
  },
  
  setup () {
    const chatHandler = inject <ChatHandler | null> (chatKey, null)
    const subscriberHandler = inject <SubscriberStreamHandler | null> (subscriberHandlerKey, null)
    const publisherHandler = inject <PublisherStreamHandler | null> (publisherHandlerKey, null)

    return {
      chatHandler,
      subscriberHandler,
      publisherHandler
    }
  },

  methods: {
    ...mapActions(States.USER, {
      setUser: 'setUser',
      setUserProperty: 'setUserProperty'
    }),

    async getUser (userId: string): Promise <User | null> {
      try {
        const result = await userApi.getUser(userId)
        
        return result || null

      } catch (err) {
        console.error(err)
        return null
      }
    },

    logout () {
      this.chatHandler?.destroySession()
      this.subscriberHandler?.destroySession()
      this.publisherHandler?.destroySession()
      this.setUser(null)
      this.setUserProperty({isAuthentificated: false})
      localStorage.clear()
      this.$router.replace({name: 'login'})
    }
  },

  

  mounted () {
    if (!this.userId) {
      return
    }

    this.getUser(this.userId).then(result => {
      if (result) {
        this.userData = result
      }
    })
  },

  render (): VNode {
    const cardTitle = <div class='user-profile__header'>
      <div class='user-profile__avatar'>
        <Avatar
          shape='circle'
          image='images/logo.svg'
          pt={{
            root: {
              class: 'user-profile__image',
            }
          }}
        />
        <Button 
          rounded 
          variant='text'
          aria-label='Edit' 
          pt={{ 
            root: { 
              class: 'user-profile__edit-button' 
            } 
          }}
        >
          {{
            icon: () => h(SvgIcon, { type: 'mdi', path: this.penIconPath})
          }}
        </Button>
      </div>
      <div class='user-profile__title'>
        <label
          class={'user-profile__username'}
        >
          {this.userData?.username || 'Anonymous'}
        </label>
      </div>
    </div>
      


    const cardContent = <div class='user-profile__content'>

      <div class='user-profile__amount'>
        <div class='user-profile__balance'> 
          <span> {`${this.$t('amount.balance')}: `} </span>
          <span>{this.userAmount || 0} </span>
        </div>
        <div class='user-profile__increase-button'>
          <Button 
            severity='contrast' 
            variant='text' 
            rounded 
            aria-label='Increase' 
          >
            {{
              icon: () => h(SvgIcon, { type: 'mdi', path: this.plusIcon})
            }}
          </Button>        
        </div>
      </div>
      <InputText
        placeholder= {this.$t('common.username')}
        modelValue={this.userData?.username || ''}
        //@ts-ignore
        onUpdate:modelValue={(value: string) => this.userData.username = value}
        pt={{
          root: {
            style: {
              width: '100%'
            }
          }
        }}
      />

      <InputText
        placeholder= {this.$t('common.login')}
        modelValue={this.userData?.login || ''}
        //@ts-ignore
        onUpdate:modelValue={(value: string) => this.userData.login = value}
        pt={{
          root: {
            style: {
              width: '100%'
            }
          }
        }}
      />
      <InputText
        placeholder={this.$t('common.password')}
        type={'password'}
        modelValue={this.newPassword}
        //@ts-ignore
        onUpdate:modelValue={(value: string) => this.newPassword = value}
        pt={{
          root: {
            style: {
              width: '100%'
            }
          }
        }}
      />
      <InputText
        placeholder={this.$t('common.repeatPassword')}
        type={'password'}
        modelValue={this.repeatPassword}
        //@ts-ignore
        onUpdate:modelValue={(value: string) => this.repeatPassword = value}
        pt={{
          root: {
            style: {
              width: '100%'
            }
          }
        }}
      />
    </div>

    const cardFooter = <div class='user-profile__footer'> 
      <Button
        label={this.$t('common.save')}
      />
      <Button
        label={this.$t('common.exit')}
        onClick={this.logout}
      />
    </div>

    return <div class='user-profile'>
      {[
          cardTitle,
          cardContent,
          cardFooter
      ]}
    </div>
  }
})
