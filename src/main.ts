import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store, keyMain, keyDevices } from './store'
import { VuesticPlugin } from 'vuestic-ui'
import 'vuestic-ui/dist/vuestic-ui.css'

createApp(App).use(store, keyMain, keyDevices).use(router).use(VuesticPlugin).mount('#app')
