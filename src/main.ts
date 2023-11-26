import { createApp } from 'vue'
import App from '@/App'
import vueCookies from 'vue-cookies'
import router from './router'
import { store, keyMain, keyDevices } from './store'

// import '@/assets/styles/reset.scss'
const crypto = globalThis.crypto
createApp(App)
  // .use(store, keyMain, keyDevices)
  .use(router)
  .use(vueCookies)
  .provide<globalThis.Crypto>('crypto', crypto)
  .mount('#app')
