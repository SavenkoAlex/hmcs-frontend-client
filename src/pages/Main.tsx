import {
  defineComponent,
  VNode,
  PropType
} from 'vue'


/** Стили */
import './Main.scss'

export default defineComponent({
  
  name: 'Main',

  data () {
    return {
      welcomeTitle: 'Добро пожаловать в приложение Streamer'
    }
  },

  render(): VNode {
    return <div class="welcome-content">
      <h1> { this.welcomeTitle } </h1>
    </div>
  }
})
