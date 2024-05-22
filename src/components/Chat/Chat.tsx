import { 
  defineComponent,
  VNode,
  PropType,
  ref,
  Transition
} from 'vue'

/** types */
import { Chat } from '@/components/Chat/types'
import { ElementScale } from '@/global/global'

/** styles */
import '@/components/Chat/Chat.scss'

/** components */
import Label from '@/components/general/Label/Label'
import TextInput from '@/components/general/inputs/TextInput/TextInput'

export default defineComponent({

  name: 'Chat',

  components: {
    Label,
    TextInput
  },

  props: {
    userId: {
      type: [String, Number] as PropType <string | number>,
      default: '00011-01022001'
    },

    chats: {
      type: Array as PropType <Chat[]>,
      default: () => [
        {id: '00011-01022001', name: 'общий', messages: [{
          id: '00011-01022001', sender: 'sasha', text: 'привет это текст-"рыба", часто используемый в печати и вэб-дизайне. Lorem Ipsum является стандартной "рыбой" для текстов на латинице с начала XVI века. В то время некий безымянный печатник создал большую коллекцию размеров и форм шрифтов, используя Lorem Ipsum для распечатки образцов. Lorem Ipsum не только успешно пережил без', date: '01.02.2020'
        },{
          id: '00013-01022001', sender: 'future-sasha', text: 'и те привет это текст-"рыба", часто используемый в печати и вэб-дизайне. Lorem Ipsum является стандартной "рыбой" для текстов на латинице с начала XVI века. В то время некий безымянный печатник создал большую коллекцию размеров и форм шрифтов, используя Lorem Ipsum для распечатки образцов. Lorem Ipsum не только успешно пережил без текст-"рыба", часто используемый в печати и вэб-дизайне. Lorem Ipsum является стандартной "рыбой" для текстов на латинице с начала XVI века. В то время некий безымянный печатник создал большую коллекцию размеров и форм шрифтов, используя Lorem Ipsum для распечатки образцов. Lorem Ipsum не только успешно пережил без', date: '01.02.2020'
        }]
      }, {
        id: '00012-01022001', name: 'приватный', messages: []
      }]
    }

  },

  computed: {
    chatLinks (): { [key: string]: Chat } {
      return this.chats.reduce<{[key: string]: Chat}>((acc, chat) => {
        acc[chat.id] = chat
        return acc
      }, {})
    }
  },

  setup () {

    const currentChat = ref <string> ()
    return {
      currentChat
    }
  },

  methods: {
    addMessage (event: KeyboardEvent) {
      const target = event?.target as HTMLInputElement

      if (this.currentChat){
        this.chatLinks[this.currentChat].messages.push({
          id: this.currentChat,
          sender: 'sasha',
          text: target.value,
          date: '01.02.2020'
        })
      }
    }
  },
  mounted() {
    this.currentChat = Object.keys(this.chatLinks)[0]
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
          >
          </TextInput>
        </div>       
    </div>
  }
})
