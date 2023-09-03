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
    component (): VNode {
      const path = `../../assets/icons/${this.iconName}.svg`
      return path
    }
  },

  render (): VNode {
    <img src={this.path} alt={this.iconName}/>  
  }
})
