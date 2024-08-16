import {
  defineComponent,
  PropType,
  VNode
} from 'vue'

/** types */
import { User } from '@/types/global'
import { UserDataProfile } from '@/components/Profile/types'
import { States } from '@/types/store'
/** api */
import userApi from '@/api/user'

/** components */
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import IconButton from '@/components/general/Buttons/IconButton/IconButton'
import Label from '@/components/general/Label/Label'
import Form from '@/components/general/Form/Form'
import TextInput from '@/components/general/inputs/TextInput/TextInput'

/** icons */
import DefaultAvatar from '@/assets/images/225-default-avatar.svg'
import LogoutIcon from '@/assets/images/logout_24.svg'

/** styles */
import '@/components/Profile/Profile.scss'

/** vuex */
import {mapActions } from 'vuex'

export default defineComponent({

  name: 'UserProfile',

  components: {
    TextButton,
    IconButton,
    Label,
    TextInput
  },

  props: {
    userId: {
      type: String as PropType <string | null>,
      default: null
    }
  },

  computed: {
    avatarSrc () {
      if (!this.userData?.avatar) {
        return null
      }
      const representation = this.userData.avatar

      return this.userData.avatar
        ? `data:image/jpg;base64,${representation}`
        : null
    }
  },

  data(): UserDataProfile {
    return {
      userData: null
    }
  },
  
  methods: {
    ...mapActions(States.USER, {
      setUser: 'setUser'
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
      this.setUser({
        login: null,
        username: null,
        role: null,
        type: null,
        id: null,
        streamId: null,
        accessToken: null,
        amount: null,
        isAuthentificated: null
      })

      this.$router.push('/')
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
    return <div class='user-profile'>
      <div class='user-profile__avatar'>
        {
          this.avatarSrc
            ? <img src={this.avatarSrc} class='user-profile__avatar_img'/>
            : <DefaultAvatar/>
        }
      </div>
      <div class='user-profile__form'>
        <Form>
          {{
            default: () => <div class='user-profile__form_body'>
              <TextInput
                label={{
                  text: this.$t('common.username')
                }}
              />
              <TextInput
                label={{
                  text: this.$t('common.login')
                }}
              />
              <TextInput
                label={{
                  text: this.$t('common.password')
                }}
              />
              <TextInput
                label={{
                  text: this.$t('common.repeatPassword')
                }}
              />
            </div>,
            footer: () => <div class='user-profile__form_footer'>
              <TextButton
                text={this.$t('common.save')}
                onClick={() => console.log('save')}
              />
            </div>
          }}
        </Form>

      </div>
      <div class='user-profile__logout'>
        <TextButton
          mode={'fourth'}
          text={this.$t('common.exit')}
          onClick={() => this.logout()}
        />
      </div>
     
    </div>
  }
})
