import { 
  defineComponent,
  VNode,
  PropType,
  ref,
  Transition
} from 'vue'

/** types */
import { Chat, Data } from '@/components/Chat/types'
import { ElementScale, JanusPlugin, UserRole, User } from '@/types/global'
import { JanusTextMessage } from '@/services/webrtc/webrtcDataExchange'
import Janus from 'janus-gateway'

/** styles */
import '@/components/Chat/Chat.scss'

/** components */
import Label from '@/components/general/Label/Label'
import TextInput from '@/components/general/inputs/TextInput/TextInput'
import IconButton from '@/components/general/Buttons/IconButton/IconButton'
import Send from '@/assets/images/send_32.svg'

/** services */
import { PublisherChatHandler } from '@/services/webrtc/webrtcDataExchange'

/** store */
import { mapGetters } from 'vuex'
import { el } from 'element-plus/es/locale'
import { format } from 'crypto-js'

export default defineComponent({

  name: 'Chat',

  components: {
    Label,
    TextInput,
    IconButton
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
    
    /** user role to identificate chat permissions */
    userRole: {
      type: String as PropType<UserRole>,
      default: UserRole.ANONYMOUS
    }
  },

  computed: {
    ...mapGetters('user', {
      getUser: 'getUserData'
    }),
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
    const inputMessage = ref <string> ('')
    const chatMessages = ref<HTMLBaseElement>()
    return {
      currentChat,
      chatHandler,
      chatLinks,
      isRoomAvailable,
      isRoomExists,
      inputMessage,
      chatMessages
    }
  },

  data (): Data {
    return {
      observer: null 
    }
  },
  methods: {
    
    addMessage () {
      if (!this.inputMessage) {
        return
      }
      this.sendMessage(this.inputMessage)
      this.inputMessage = ''
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
    },

    /** scroll down chat messages */
    observeChat (mutationRecords: MutationRecord[]) {
      mutationRecords.forEach(mutation => {
        if (mutation.type === 'childList') {
          this.chatMessages?.scroll({
            top: 1000,
            behavior: 'smooth'
          })
        }
      })
    },

    /** returns user attribute to identificate and highlight user message */
    getUserAttr (sender: string) {
      return this.getUser?.username === sender ? 'me' : 'guest'
    },

    getMessageTime (date: string) {
      const dateInstance = new Date(date)

      if (!dateInstance) {
        return ''
      }

      const hours = this.formatTime(dateInstance.getHours())
      const minutes = this.formatTime(dateInstance.getMinutes())
      const seconds = this.formatTime(dateInstance.getSeconds())

      return `${hours}.${minutes}.${seconds}`
    },

    formatTime (value: number) {
      return value < 10
        ? 0 + value
        : String(value) 
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

    // we need observer to scroll added messages to bottom 
    this.observer = new MutationObserver(this.observeChat)

    if (this.observer && this.chatMessages) {
      this.observer.observe(this.chatMessages, {
        childList: true
      })
    }
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
      <div class='chat__content' ref='chatMessages'>
        {
          this.currentChat && this.chatLinks[this.currentChat].messages.map((message) => {
            return <div 
                class='chat__message'
                user-data={this.getUserAttr(message.sender)}
              >
                <div class='chat__message_nick' user-data={ this.getUserAttr(message.sender) }>
                  <Label
                    text={message.sender}
                    scale={ElementScale.LARGE}
                  />
                </div>
                <div class='chat__message_text'>
                  <p class='chat__message_paragraph'> { message.text || ''} </p>
                </div>
                <div class='chat__message_time'>
                  <Label
                    text={ this.getMessageTime(message.date) }
                    scale={ElementScale.SMALL} 
                  />
                </div> 
              </div>
            })
        }
      </div>
      <div class='chat__submit'>
        <div class='chat__input'>
          <TextInput
            placeholder='Сообщение'
            onEnter={() => this.addMessage()}
            disabled={!this.isRoomAvailable}
            modelValue={this.inputMessage}
            onUpdate:modelValue={(data: string) => this.inputMessage = data}
          >
          </TextInput>
        </div>
        <div class='chat__button'>
          <IconButton
            //disabled={this.isRoomAvailable}
            mode={'primary'}
            onClick={() => this.addMessage()}
          >
            <Send/>
          </IconButton>
        </div>
      </div>       
    </div>
  }
})
