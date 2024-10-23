import { 
  defineComponent,
  VNode,
  PropType,
  ref,
  Transition,
  inject
} from 'vue'

/** types */
import { Chat, Data } from '@/components/Chat/types'
import { ElementScale, UserRole, chatKey } from '@/types/global'
import { JanusTextMessage } from '@/services/webrtc/webrtcDataExchange'

/** styles */
import '@/components/Chat/Chat.scss'

/** components */
import Label from '@/components/general/Label/Label'
import TextInput from '@/components/general/inputs/TextInput/TextInput'
import IconButton from '@/components/general/Buttons/IconButton/IconButton'
import Send from '@/assets/images/send_32.svg'

/** services */
import { ChatHandler } from '@/services/webrtc/webrtcDataExchange'

/** store */
import { mapGetters } from 'vuex'

/** helpers */
import { formatTime } from '@/helpers/helper'

/** notifier */
import { useToast } from 'vue-toastification'

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

    /**room createing flag */
    isRoomAvailable: {
      type: Boolean as PropType <boolean>,
      default: false
    }
  },

  computed: {
    ...mapGetters('user', ['userData', 'userRole']),
  },

  watch: {
    room (newValue: number, oldValue) {

      if (newValue == oldValue) {
        return
      }

      if (this.chatHandler) {
        this.chatHandler.destroyHandler(this.room)
      }
    },

    isRoomAvailable: {
      handler: function (newValue: boolean) {
        if (!newValue ) {
          return
        }

        this.initChat()
      }, 
      immediate: true
    },
  },

  setup () {
    const chatHandler = inject <ChatHandler | null> (chatKey, null)
    const currentChat = ref <string> ()
    const chatLinks = ref <Record<string, Chat>>({})
    const isRoomAvailable = ref <boolean> (false)
    const isRoomExists = ref <boolean> (false)
    const inputMessage = ref <string> ('')
    const chatMessages = ref<HTMLBaseElement>()
    const toast = useToast()

    return {
      chatHandler,
      currentChat,
      chatLinks,
      isRoomAvailable,
      isRoomExists,
      inputMessage,
      chatMessages,
      toast
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

    async sendMessage (text: string) {
      if (!this.chatHandler) {
        return false
      }

      const result = await this.chatHandler.sendMessage(text, this.room)
      return result
    },

    handleError (error: unknown): void {
      this.toast.error(this.$t('services.chat.errors.canNotConnectChat'))
      this.isRoomAvailable = false
    },

    handleData (data: string): void {
      try {
        const dataParsed: JanusTextMessage = typeof data === 'string' ? JSON.parse(data) : data

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
        return
      }
    },

    ondataopen(label: string) {
      this.isRoomExists = true
      this.isRoomAvailable = this.userRole !== UserRole.ANONYMOUS
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
      return this.userData?.username === sender ? 'me' : 'guest'
    },

    getMessageTime (date: string) {
      const dateInstance = new Date(date)

      if (!dateInstance) {
        return ''
      }

      const hours = formatTime(dateInstance.getHours())
      const minutes = formatTime(dateInstance.getMinutes())
      const seconds = formatTime(dateInstance.getSeconds())
      return `${hours}.${minutes}.${seconds}`
    },

    async joinAsPublisher () {
      if (!this.chatHandler || !this.userData?.streamId || !this.userData?.username) {
        this.toast.error(this.$t('services.chat.errors.chatHandlerIsNotAvailable'))
        return false
      } 
      
      if (!this.isRoomExists) {
        this.isRoomExists = await this.chatHandler.createRoom(this.room)
      }

      if (this.isRoomExists) {
        this.isRoomAvailable = await this.chatHandler.register(this.chatName, this.room)
      }

      if (!this.isRoomAvailable || !this.isRoomExists) {
        this.toast.error(this.$t('services.chat.errors.canNotConnectChat'))
      }
    },

    async join () {
      if (!this.chatHandler) {
        this.toast.error(this.$t('services.chat.errors.chatHandlerIsNotAvailable'))
        return
      }
      /**
       * depends on user role we have to create or join existing room
       */
      const exists = await this.chatHandler?.exists(this.room)

      if (exists && this.userRole === UserRole.USER) {
        this.joinAsSubscriber()
        return 
      } else if (!exists && UserRole.WORKER) {
        this.joinAsPublisher()
        return
      }

      this.isRoomExists = exists
      if (this.userRole !== UserRole.ANONYMOUS) {
        this.isRoomAvailable = await this.chatHandler.register(this.chatName, this.room)
        if (!this.isRoomAvailable) {
          this.toast.error(this.$t('services.chat.errors.canNotConnectChat'))
        }
        return
      }
      this.isRoomAvailable = false
    },
    async joinAsSubscriber() {
      if (!this.chatHandler) {
        this.isRoomAvailable = false
        this.toast(this.$t('services.chat.errors.chatHandlerIsNotAvailable'))
        return
      }

      const result = await this.chatHandler.register(this.chatName, this.room * 1000)

      if (!result) {
        this.toast(this.$t('services.chat.errors.canNotConnectChat'))
        this.isRoomAvailable = false
      }
    },
    
    async initChat () {
      if (!this.chatHandler) {
        return
      }
      this.join()
    },

    addListeners () {
      this.chatHandler?.emitter.on('pluginerror', this.handleError)
      this.chatHandler?.emitter.on('handlererror', this.handleError)
      this.chatHandler?.emitter.on('handlerdata', this.handleData)
      this.chatHandler?.emitter.on('plugindata', this.handleData)
      this.chatHandler?.emitter.on('dataisopen', this.ondataopen)
    }
  },

  
  mounted() {
    this.$nextTick(() => {
      this.addListeners()
    })

    this.currentChat = `${this.$t('components.chat.defaultChatName')} ${this.chatName}`

    this.chatLinks[this.currentChat] = {
      id: `${this.currentChat}`,
      name: `${this.currentChat}`,
      messages: []
    }

    // we need observer to scroll added messages to bottom 
    this.observer = new MutationObserver(this.observeChat)

    if (this.observer && this.chatMessages) {
      this.observer.observe(this.chatMessages, {
        childList: true
      })
    }

  },

  unmounted () {
    this.chatHandler?.emitter.removeAllListeners()
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
