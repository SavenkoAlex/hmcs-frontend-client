import {
  defineComponent,
  PropType,
  VNode
} from 'vue'

export default defineComponent({

  name: 'SimpleText',

  props: {
    text: {
      type: String as PropType<string>,
      default: ''
    }
  },


})
