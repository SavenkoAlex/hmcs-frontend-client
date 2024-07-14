import { 
  defineComponent,
  VNode,
  PropType,
  ref,
  Transition
} from 'vue'

/** types */
import { Chat } from '@/components/Chat/types'
import { ElementScale, JanusPlugin, UserRole, User } from '@/types/global'
import { JanusTextMessage } from '@/services/webrtc/webrtcDataExchange'
import Janus from 'janus-gateway'

/** styles */
import '@/components/Chat/Chat.scss'

/** components */
import Label from '@/components/general/Label/Label'
import TextInput from '@/components/general/inputs/TextInput/TextInput'

/** services */
import { PublisherChatHandler } from '@/services/webrtc/webrtcDataExchange'

/** store */
import { mapGetters } from 'vuex'

export default defineComponent({

  name: 'Chat',

  components: {
    Label,
    TextInput
  },

  props: {
    /** room id same as videoroom id */
    room: {
      type: Number as PropType <number>,
      default: 0
    },
    /** username (nick) to display */
    chatName: {
      type: String as PropType <string>,
      required: true
    },

    userRole: {
      type: String as PropType<UserRole>,
      default: UserRole.ANONYMOUS
    }
  },

  computed: {
    ...mapGetters('user', ['getUser']),
  },
  watch: {
    room (newValue: number, oldValue) {

      if (newValue == oldValue) {
        return
      }

      if (this.chatHandler) {
        this.chatHandler.destroyHandler()
      }
    },

  },

  setup () {
    const chatHandler = ref <PublisherChatHandler | null> (null)
    const currentChat = ref <string> ()
    const chatLinks = ref <Record<string, Chat>>({})
    const isRoomAvailable = ref <boolean> (false)
    const isRoomExists = ref <boolean> (false)

    return {
      currentChat,
      chatHandler,
      chatLinks,
      isRoomAvailable,
      isRoomExists
    }
  },

  methods: {
    addMessage (event: KeyboardEvent) {
      const target = event?.target as HTMLInputElement

      this.sendMessage(target.value)

    },

    async initChatHandler (): Promise <boolean> {

      const streamId = this.room
      const displayName = this.chatName

      if (!streamId || ! displayName) {
        return false
      }

      return PublisherChatHandler.init(Janus, JanusPlugin.VITE_TEXT_PLUGIN, {
        streamId,
        displayName
      }).then(handler => {
        if (!handler) {
          this.chatHandler = null
          return false
        }

        this.chatHandler = handler
        return true
      }).then(() => {
        if (!this.chatHandler) {
          this.chatHandler = null
          return false
        }
        return true
      }).catch(err => {
        console.error(err)
        this.chatHandler = null
        return false
      })
    },

    async initPublisherBroadcast () {
      if (!this.chatHandler || !this.getUser?.streamId || !this.getUser?.username) {
        return false
      } 

      await this.chatHandler.exists()

      if (this.isRoomExists) {
        this.isRoomAvailable = await this.chatHandler.register()
      }

      this.isRoomExists = await this.chatHandler.createRoom()
      if (this.isRoomExists) {
        this.isRoomAvailable = await this.chatHandler.register()
      }
    },

    async join () {
      if (!this.chatHandler) {
        return
      }

      return await this.chatHandler.register()
    },


    async sendMessage (text: string) {
      if (!this.chatHandler) {
        return false
      }

      return await this.chatHandler.sendMessage(text)
    },

    async getRooms () {
      if (!this.chatHandler) {
        return
      }

      const result = await this.chatHandler.getRooms()
      return
    },

    handleError (error: unknown): void {
      console.warn('error handlelr ', error)
    },

    handleData (data: string): void {
      try {
        const dataParsed: JanusTextMessage = JSON.parse(data)

        if ('exists' in dataParsed) {
          this.isRoomExists = !!dataParsed.exists
        }

        if (dataParsed.textroom === 'message' && this.currentChat) {
          this.chatLinks[this.currentChat].messages.push({
            id: dataParsed.from,
            sender: dataParsed.from,
            text: dataParsed.text || '',
            date: dataParsed.date || ''
          })
        }
      } catch (err) {
        console.error(err)
      }
    }
  },

  async mounted() {
    this.currentChat = `${this.chatName}-share`

    this.chatLinks[this.currentChat] = {
      id: `${this.currentChat}`,
      name: `${this.currentChat}`,
      messages: []
    }

    await this.initChatHandler()

    if (!this.chatHandler) {
      return
    }

    this.chatHandler?.emitter.on('connected', this.initPublisherBroadcast)
    this.chatHandler?.emitter.on('pluginerror', this.handleError)
    this.chatHandler?.emitter.on('handlererror', this.handleError)
    this.chatHandler?.emitter.on('handlerdata', this.handleData)
    this.chatHandler?.emitter.on('plugindata', this.handleData)
  },

  unmounted () {
    if (this.chatHandler) {
      this.chatHandler?.destroyHandler()
    }
  },

  render (): VNode {
    return <div class='chat'>

      <div class='chat__list'>
        {
          this.chatLinks && Object.keys(this.chatLinks).map((chatId) => {
            const chat = this.chatLinks[chatId]
            return <Transition>
              <div
                class={chat.id === this.currentChat ? 'chat__item chat__item_current' : 'chat__item'}
                onClick={() => this.currentChat = chat.id}
              > 
                <span>{this.chatLinks[chatId].name}</span>
            </div>
            </Transition>
          })
        }
      </div>
      <div class='chat__content'>
        {
          this.currentChat && this.chatLinks[this.currentChat].messages.map((message) => {
            return <div class={/*this.userId*/ '00011-01022001' === message.id ? 'chat__message_my' : 'chat__message'}>
              <div class='chat__message_info'>
                <Label
                  text={message.sender}
                  scale={ElementScale.LARGE}
                />
                <Label
                  text={ message.date }
                  scale={ElementScale.MEDIUM} 
                />
              </div>
              <div class='chat__message_text'>
                <p> { message.text } </p>
              </div>
              
            </div> 
          })
        }
      </div>
      <div class='chat__message-input'>
          <TextInput
            placeholder='Сообщение'
            onEnter={(event: KeyboardEvent) => this.addMessage(event)}
            disabled={!this.isRoomAvailable}
          >
          </TextInput>
      </div>       
    </div>
  }
})
