import {
  defineComponent,
  VNode,
  PropType,
  inject,
  Transition
} from 'vue'

/** styles */
import { InputLabel, SidePosition } from '@/global/global'

/** components */
import Label from '@/components/general/Label/Label'

/** style */
import '@/components/general/inputs/TextInput/TextInput.scss'

/** types */
import { ErrorBucket, InputError } from '@/global/global'

export default defineComponent({

  name: 'TextInput',

  components: {
    Label
  },

  emits: ['update:modelValue'],

  props: {
    label: {
      type: Object as PropType <InputLabel | null>,
      default: null
    },
    placeholder: {
      type: String as PropType<string>,
      defaukt: ''
    },
    type: {
      type: String as PropType <'text' | 'password'>,
      default: 'text'
    },
    labelPosition: {
      type: String as PropType<SidePosition>,
      default: SidePosition.TOP
    },
    modelValue: {
      type: String as PropType <string>,
      defaule: ''
    },
    validators: {
      type: Object as PropType <Array<(value: string) => InputError>>,
      default: []
    }
  },

  watch: {
    modelValue (value) {
      let result = null
      for (const validateFn of this.validators) {
        result = validateFn(value)
        if (result) {
          this.errorBucket[this.inputId] = result
          return
        }
      }

      this.errorBucket[this.inputId] = result
    }
  },

  
  setup () {
    const crypto = inject <Crypto> ('cryto', globalThis.crypto)
    const inputId = crypto.randomUUID()
    
    const errorBucket = inject <ErrorBucket>('errorBucket', {
      inputId: null
    })

    errorBucket[inputId] = null
    
    return {
      errorBucket,
      inputId
    }
  },

  methods: {
    onInput (payload: Event) {
      const target = payload.target
      
      this.$emit('update:modelValue', (target as HTMLInputElement)?.value)
    },

    inputHasError () {
      if (!this.inputId || !this.errorBucket) {
        return false
      }

      return !!this.errorBucket[this.inputId]
    }
  },

  render (): VNode {
    return <div class={this.inputHasError() ?  'input-text-container_error' : 'input-text-container'}>
      {
        this.label && <Label  scale={this.label.scale} text={this.label.text}/>
      }
      <Transition name='focus'>
        <input
          type={this.type}
          placeholder={this.placeholder}
          value={this.modelValue}
          onInput={ event => this.onInput(event)}
        />
      </Transition>
    </div>
  }
})
