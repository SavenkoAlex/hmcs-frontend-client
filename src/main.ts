import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store, key } from './store'
import { VuesticPlugin } from 'vuestic-ui'
import 'vuestic-ui/dist/vuestic-ui.css'

createApp(App).use(store, key).use(router).use(VuesticPlugin).mount('#app')
