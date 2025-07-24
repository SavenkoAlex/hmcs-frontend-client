import {
  defineComponent,
  inject,
  nextTick,
  PropType,
  ref,
  VNode
} from 'vue'

/** types */
import { Chat, Data, QueueMaxSize } from '@/components/Chat/types'
import { JanusTextMessage } from '@/services/webrtc/webrtcDataExchange'
import { chatKey, ElementScale, UserRole } from '@/types/global'

/** styles */
import '@/components/Chat/Chat.scss'

/** components */
import IconButton from '@/components/general/Buttons/IconButton/IconButton'
import Label from '@/components/general/Label/Label'
import TextInput from '@/components/general/inputs/TextInput/TextInput'
import {
  Button,
  Card,
  InputGroup,
  InputGroupAddon,
  InputText,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from 'primevue'

/** services */
import { ChatHandler } from '@/services/webrtc/webrtcDataExchange'

/** store */
import { mapGetters } from 'vuex'

/** helpers */
import { formatTime } from '@/helpers/helper'

/** notifier */
import { useToast } from 'vue-toastification'

/** chat service */
import { MessageHandler, MessageType, UserMessage } from '@/services/MessageHandler/MessageHandler'

/** icons */
import { mdiSendCircleOutline } from '@mdi/js'
import SvgIcon from '@jamescoyle/vue-icon'

export default defineComponent({

  name: 'Chat',

  components: {
    Label,
    TextInput,
    IconButton,
    Card,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    InputText,
    Button,
    SvgIcon
  },

  emits: {
    'join-request': function(message: JanusTextMessage) {
      return message
    },
    'request-allowed': function(message: JanusTextMessage) {
      return message
    },
    'request-declined': function(message: JanusTextMessage) { 
      return message 
    } 
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
    isStreamAvailable: {
      type: Boolean as PropType <boolean>,
      default: false
    },

    isReadyToPrivate: {
      type: Boolean as PropType <boolean>,
      default: false
    },

    secret: {
      type: String as PropType <string | null>,
      default: null
    }
  },

  computed: {
    ...mapGetters('user', ['userData', 'userRole', 'isAuthentificated']),

    isChatDisabled (): boolean {
      return !this.isStreamAvailable || !this.isRoomExists || !this.isAuthentificated || !this.room
    },

    isReadyToConnect (): boolean {
      return !!(this.isStreamAvailable && this.chatHandler)
    },

    currentChatName (): string {
      return `${this.$t('components.chat.defaultChatName')} ${this.chatName}`
    }
  },

  watch: {
    chatHandler: {
      handler: function (newValue: ChatHandler | null) {
        if (!newValue) {
          return
        }
        this.addListeners()
      },
      immediate: true
    },

    isReadyToConnect (newValue) {
      if (newValue) {
        this.join()
      }
    },

    'messageQueue.length': {
      handler: function (newValue) {
        if (newValue > QueueMaxSize) {
          this.messageQueue.shift()
          return
        }
      },
    },

    chatName: {
      handler: function (newValue: string) {

        if (!newValue) {
          return
        }

        this.currentChat = `${newValue}`
        this.chatLinks[newValue] = {
          id: `${newValue}`,
          name: `${this.currentChatName}`,
          messages: [{  
            id: '1',
            sender: 'me',
            text: `${this.$t('components.chat.welcomeMessage')}`,
            date: 'now'
          }]
        }
      },
      immediate: true
    },

    secret (newValue: string) {
      if (newValue) {
        this.sendSecret()
      }
    }
  },

  setup () {
    const chatHandler = inject <ChatHandler | null> (chatKey, null)
    const currentChat = ref <string> ()
    const chatLinks = ref <Record<string, Chat>>({})
    const isRoomExists = ref <boolean> (false)
    const inputMessage = ref <string> ('')
    const chatMessages = ref<HTMLBaseElement>()
    const toast = useToast()
    const messageQueue = ref<Promise<void>[]>([])
    const sendIconPath = mdiSendCircleOutline

    return {
      chatHandler,
      currentChat,
      chatLinks,
      isRoomExists,
      inputMessage,
      chatMessages,
      toast,
      messageQueue,
      sendIconPath
    }
  },

  data (): Data {
    return {
      observer: null,
      needToHandleMessages: false
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

      const message = MessageHandler.packMessage(MessageType.SIMPLEMESSAGE, text)

      if (!message || !this.room) {
        return false
      }

      const result = await this.chatHandler.sendMessage(message, this.room)
      return result
    },

    handleError (error: unknown): void {
      this.toast.error(this.$t('services.chat.errors.canNotConnectChat'))
    },

    handleData (data: JanusTextMessage): void {
      this.messageQueue.push(this.handleMessageItem(data))
    },
    
    handleMessageItem (message: JanusTextMessage): Promise<void> {
      return nextTick(() => {

        if (!message?.text || message?.textroom !== 'message' || !this.currentChat) {
          return
        }

        const text = this.parseMessage(message)

        if (!text) {
          return
        }
        
        this.chatLinks[this.currentChat].messages.push({
          id: message.from,
          sender: message.from,
          text: text || '',
          date: message.date || ''
        })

        this.messageQueue.shift()
      })
    },

    parseMessage (message: JanusTextMessage): string | undefined {
      if (!message?.text) {
        return
      }

      const text = MessageHandler.unPackMessage(message.text)
      const type = text?.type
      message = { ...message, ...{ text: text?.text || '' } }

      switch (type) {
        case MessageType.JOINREQUEST:
          this.$emit('join-request', message)
          return

        case MessageType.REQUESTALLOWED:
          this.$emit('request-allowed', message)
          return

        case MessageType.REQUESTDECLINED:
          this.$emit('request-declined', message)
          return

        case MessageType.SIMPLEMESSAGE:
          return message.text

        default:
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

    /** create room and join */
    async joinAsPublisher () {
      if (!this.chatHandler || !this.userData?.streamId || !this.userData?.username) {
        this.toast.error(this.$t('services.chat.errors.chatHandlerIsNotAvailable'))
        return false
      } 
      
      if (!this.isRoomExists) {
        this.isRoomExists = await this.chatHandler.createRoom(this.room)
      }

      if (this.isRoomExists) {
        await this.register()
      }
    },

    async join () {
      if (!this.chatHandler) {
        this.toast.error(this.$t('services.chat.errors.chatHandlerIsNotAvailable'))
        return
      }

      const exists = await this.chatHandler?.exists(this.room)
      this.isRoomExists = exists

      if (this.isRoomExists && (this.userRole === UserRole.USER || this.userRole === UserRole.WORKER)) {
        this.register()
        return
      }

      if (this.userRole === UserRole.WORKER) {
        this.joinAsPublisher()
        return
      }
    },

    async register (): Promise <boolean> {
      if (!this.chatHandler) {
        this.toast(this.$t('services.chat.errors.chatHandlerIsNotAvailable'))
        return false
      }

      const result = await this.chatHandler.register(this.userData?.username || 'noname', this.room)

      if (!result) {
        this.toast(this.$t('services.chat.errors.canNotConnectChat'))
      }
      return result
    },

    destroyChat () {
      if (!this.chatHandler) {
        return
      }
      this.chatHandler.destroyChat(this.room)
    },

    addListeners () {
      this.chatHandler?.emitter?.on('janus-error', err => this.handleError(err))
      this.chatHandler?.emitter?.on('text-message', msg => this.handleData(msg))
      this.chatHandler?.emitter.on('janus-ondataopen', data => this.ondataopen(data))
    },

    reconnect() {
      console.log('here we are trying to recoonect')
    },

    async sendSecret (): Promise <boolean> {
      if (!this.chatHandler || !this.secret) {
        return false
      }
      const result = await this.chatHandler.sendMessage(this.secret, this.room)
      return result
    } 
  },

  mounted() {
    
    // we need observer to scroll added messages to bottom 
    this.observer = new MutationObserver(this.observeChat)

    if (this.observer && this.chatMessages) {
      this.observer.observe(this.chatMessages, {
        childList: true
      })
    }

  },

  unmounted () {
    this.chatHandler?.emitter.all.clear()
  },

  render (): VNode {

    
    return <div class='chat'>
      <Tabs 
        value={this.chatName} 
        scrollable
        pt={{
          root: {
            class: 'chat__tabs'
          }
        }}
        dt={{
          tabpanel: {
            padding: 0
          }
        }}
      >
        <div class='chat__list'>
          <TabList>
            {
              this.chatLinks && Object.keys(this.chatLinks).map((chatId) => <Tab 
                key={this.chatLinks[chatId].name} 
                value={this.chatLinks[chatId].id}
              >
                  { this.chatLinks[chatId].name }
              </Tab>)
            }
          </TabList>
        </div>
        
        <div class='chat__content'>
          <TabPanels>
            {
              this.chatLinks && Object.keys(this.chatLinks).map(chatId => <TabPanel 
                key={this.chatLinks[chatId].name} 
                value={this.chatLinks[chatId].id}
              >
                <div class='chat__messages'>

                </div>
              </TabPanel>)
            }
          </TabPanels>
        </div>
        <div class='chat__submit'>
          <div class='chat__input'>
            <InputGroup>
              <InputText
                placeholder='Сообщение'
                disabled={this.isChatDisabled}
                modelValue={this.inputMessage}
                //@ts-ignore
                onUpdate:modelValue={(data: string) => this.inputMessage = data}
              />
              <InputGroupAddon>
                <Button severity={'secondary'}>
                  {{
                    icon: () => <SvgIcon type={'mdi'} path={this.sendIconPath} />
                  }}
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div> 
      </Tabs>
    </div>
    /*
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
            disabled={this.isChatDisabled}
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
    */
  }
})
