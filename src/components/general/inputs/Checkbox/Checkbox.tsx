import {
  defineComponent,
  PropType,
  VNode
} from 'vue'

/** components */
import Label from '@/components/general/Label/Label'

/** style */
import '@/components/general/inputs/Checkbox/Checkbox.scss'

/** types */
import { InputLabel, SidePosition } from '@/types/global'

/** helpers */
import { getFlexOrientation } from '@/helpers/helper'

export default defineComponent({

  name: 'Checkbox',

  components: {
    Label    
  },

  emits:['update:modelValue'],

  props: {
    modelValue: {
      type: Boolean as PropType <boolean>,
      defult: false
    },
    label: {
      type: Object as PropType <InputLabel | null>,
      default: null
    },
    labelPosition: {
      type: String as PropType<SidePosition>,
      default: SidePosition.TOP
    },
  },

  computed: {
    style () {
      return getFlexOrientation(this.labelPosition)
    }
  },
  methods: {
    /**
     * Handle change event from the checkbox input
     * @event
     * @public
     *
     * @param {Event} event The change event
     */
    onChange (event: Event): void {
      /**
       * The update:modelValue event is emitted when the checkbox value is changed
       * @property {boolean} modelValue The new value of the checkbox
       */
      this.$emit('update:modelValue', (event.target as HTMLInputElement).checked)
    }
  },

  render (): VNode {
    return <div 
      class='input-checkbox-container'
      style={this.style}
    >
      {
        this.label && <Label  scale={this.label.scale} text={this.label.text}/>
      }

      <input
        type='checkbox'
        value={this.modelValue}
        onChange={ event => this.onChange(event)}
      />
    </div>
  }
})
