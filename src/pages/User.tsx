import {
  defineComponent,
  VNode,
  PropType
} from 'vue'

export default defineComponent({
  
  name: 'User',

  props: {
    //
  },

  render(): VNode {
    return <div class={'user-profile'}>
      <h1> { 'Hello User' } </h1>
    </div>
  }
})
