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
import { Card, Button, Avatar, InputText, OverlayBadge }  from 'primevue'

/** icons */
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiPlus } from '@mdi/js';

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
    }
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
      plusIconPath: mdiPlus,
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
    const cardTitle = <OverlayBadge 
      value={this.userAmount} 
      severity={this.userAmount >= MIN_AMOUNT ? 'success' :  'danger'}
      class='inline-flex'
    >
      <Avatar
        image={this.avatarSrc}
        size={'xlarge'}
        shape='circle'
      />
    </OverlayBadge>

    const cardSubtitle = <Button
      label={this.userAmount.toString()}
      size='small'
      variant='outlined' 
      raised
    >   
      {{
        icon: () => h(SvgIcon, { path: this.plusIconPath, type: 'mdi' })
      }} 
    </Button>

    const cardContent = <div class='user-profile__content'>

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
      <Card
        pt={{
          root: {
            style: {
              width: '100%',
              height: '100%'
            }
          },
          body: {
            class: 'user-profile__body'
          },
          header: {
            class: 'user-profile__header'
          },
          title: {
            class: 'user-profile__title'
          }
        }}
      >
        {{
          header: () => <img src={'/images/taro-bg.jpg'}/>,
          title: () => cardTitle,
          content: () => cardContent,
          footer: () => cardFooter
        }}
      </Card>
    </div>
  }
})
