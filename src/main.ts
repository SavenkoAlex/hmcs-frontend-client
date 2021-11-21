import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import Argon from './plugins/argon-kit'

createApp(App).use(store).use(router).use(Argon).mount('#app')
