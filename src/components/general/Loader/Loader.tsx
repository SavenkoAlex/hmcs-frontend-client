import {
  defineComponent,
  VNode,
} from 'vue'

/** style */
import './Loader.scss'

export default defineComponent({

  name: 'Loader',

  render(): VNode {
    return <div class='loader'>
      <div class='loader__spinner'></div>
    </div>
  }
})
