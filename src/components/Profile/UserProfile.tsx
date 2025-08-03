import {
  defineComponent,
  PropType,
  VNode,
  inject,
  h
} from 'vue'

/** types */
import { User, chatKey, publisherHandlerKey, subscriberHandlerKey} from '@/types/global'
import { UserDataProfile } from '@/components/Profile/types'
import { States } from '@/types/store'
import { ChatHandler } from '@/services/webrtc/webrtcDataExchange'
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'
import { PublisherStreamHandler } from '@/services/webrtc/webrtcPublisher'

/** api */
import userApi from '@/api/user'

/** components */
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import IconButton from '@/components/general/Buttons/IconButton/IconButton'
import Label from '@/components/general/Label/Label'
import TextInput from '@/components/general/inputs/TextInput/TextInput'
import { Card, Button, Avatar, InputText }  from 'primevue'

/** icons */
import { mdiPlus } from '@mdi/js';
import SvgIcon from '@jamescoyle/vue-icon'

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
    TextButton,
    IconButton,
    Label,
    TextInput,
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
      plusIconPath: mdiPlus
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
    const cardTitle = <Avatar
      image={this.avatarSrc}
      size={'xlarge'}
    />

    const cardSubtitle = <Button
      label={this.userAmount.toString()}
      size='small'
      variant='outlined' 
      raised
    >   
      {{
        icon: () => h(SvgIcon, { path: this.plusIconPath, type: 'mdi', size: '1rem'})
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
              height: '100%',
            }
          },
          body: {
            style: {
              height: '100%'
            }
          }
        }}
      >
        {{
          title: () => cardTitle,
          subtitle: () => cardSubtitle,
          content: () => cardContent,
          footer: () => cardFooter
        }}
      </Card>
    </div>
  }
})
