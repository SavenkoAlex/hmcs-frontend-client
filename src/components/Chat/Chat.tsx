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
import { AttachEvent, TEXT_ROOM_PLUGIN_EVENT, webRTCEventJanusMap } from '@/types/janus'
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
    chatRoom (): number {
      return (this.room + 1) * 1000
    }
  },

  watch: {
    chatHandler: {
      handler: function (newValue: ChatHandler | null) {
        if (!newValue) {
          return
        }
        this.addListeners()
        if (this.isRoomAvailable && !this.isRoomExists) {
          this.initChat()
        }
      },
      immediate: true
    },

    isRoomAvailable: {
      handler: function (newValue: boolean) {
        if (!newValue ) {
          return
        }
        this.initChat()
      }, 
    },
  },

  setup () {
    const chatHandler = inject <ChatHandler | null> (chatKey, null)
    const currentChat = ref <string> ()
    const chatLinks = ref <Record<string, Chat>>({})
    const isRoomExists = ref <boolean> (false)
    const inputMessage = ref <string> ('')
    const chatMessages = ref<HTMLBaseElement>()
    const toast = useToast()

    return {
      chatHandler,
      currentChat,
      chatLinks,
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

      const result = await this.chatHandler.sendMessage(text, this.chatRoom)
      return result
    },

    handleError (error: unknown): void {
      this.toast.error(this.$t('services.chat.errors.canNotConnectChat'))
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
        this.isRoomExists = await this.chatHandler.createRoom(this.chatRoom)
      }

      if (this.isRoomExists) {
        await this.chatHandler.register(this.chatName, this.chatRoom)
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
      const exists = await this.chatHandler?.exists(this.chatRoom)
      this.isRoomExists = exists

      if (this.isRoomExists && this.userRole === UserRole.USER) {
        this.joinAsSubscriber()
        return 
      } else if (this.userRole === UserRole.WORKER) {
        this.joinAsPublisher()
        return
      }

      if (this.userRole !== UserRole.ANONYMOUS) {
        await this.chatHandler.register(this.chatName, this.chatRoom)
        if (!this.isRoomAvailable) {
          this.toast.error(this.$t('services.chat.errors.canNotConnectChat'))
        }
        return
      }
    },
    async joinAsSubscriber() {
      if (!this.chatHandler) {
        this.toast(this.$t('services.chat.errors.chatHandlerIsNotAvailable'))
        return
      }

      const result = await this.chatHandler.register(this.userData?.username || 'noname', this.chatRoom)

      if (!result) {
        this.toast(this.$t('services.chat.errors.canNotConnectChat'))
      }
    },
    
    async initChat () {
      if (!this.chatHandler) {
        return
      }
      this.join()
    },

    destroyChat () {
      if (!this.chatHandler) {
        return
      }
      this.chatHandler.destroyHandler(this.chatRoom)
    },

    addListeners () {
      this.chatHandler?.emitter.on(webRTCEventJanusMap[AttachEvent.ERROR], err => this.handleError(err))
      this.chatHandler?.emitter.on(TEXT_ROOM_PLUGIN_EVENT.DATA, data => this.handleData(data))
      this.chatHandler?.emitter.on(webRTCEventJanusMap[AttachEvent.ONDATAOPEN], data => this.ondataopen(data))
    }
  },

  mounted() {
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
            disabled={!this.isRoomExists}
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
