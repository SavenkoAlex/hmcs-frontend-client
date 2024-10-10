import { createApp } from 'vue'
import App from '@/App'
import vueCookies from 'vue-cookies'
import router from './router'
import { store } from '@/store'
import { createI18n } from 'vue-i18n'
import ruLocale from '@/langs/ru.json'
import enLocale from '@/langs/en.json'
import Toast, { PluginOptions, POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const i18n = createI18n({
  locale: 'ru-RU',
  messages: {
    'ru-RU': ruLocale,
    'en_US': enLocale
  },
  fallbackLocale: 'en-US'
})
const toastOptions:PluginOptions = {
  position: POSITION.BOTTOM_CENTER,
  closeOnClick: true,
  hideProgressBar: true
}

createApp(App)
  // .use(store, keyMain, keyDevices)
  .use(Toast, toastOptions)
  .use(router)
  .use(vueCookies)
  .use(i18n)
  .use(store)
  .provide <Crypto> ('crypto', globalThis.crypto)
  .mount('#app')
