import {
  defineComponent,
  PropType,
  VNode
} from 'vue'

export default defineComponent({

  name: 'icon',

  props: {
    iconName: {
      type: String as PropType<string>,
      required: true
    }
  },

  computed: {
    path (): string {
      const path = import(`${this.iconName}.svg?url`)
      return path
    }
  },

  data () {
    return {
      svg: null
    }
  },

  watch: {
    iconName: {
      handler: () => this.svg = import(`${this.iconName}.svg?url`),
      immedate: true
    }
  },

  methods: {
    importSvg (path: string) {
      return import(path)      
    }
  },
  
  render (): VNode {
    return this.svg
  }
})
