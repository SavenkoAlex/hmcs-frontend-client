import { createApp, provide } from 'vue'
import App from '@/App'
import vueCookies from 'vue-cookies'
import router from './router'
import { store, keyMain, keyDevices } from './store'
import { createI18n } from 'vue-i18n'
// import '@/assets/styles/reset.scss'

import ruLocale from '@/langs/ru.json'
import enLocale from '@/langs/en.json'

const i18n = createI18n({
  locale: 'ru-RU',
  messages: {
    'ru-RU': ruLocale,
    'en_US': enLocale
  },
  fallbackLocale: 'en-US'
})


createApp(App)
  // .use(store, keyMain, keyDevices)
  .use(router)
  .use(vueCookies)
  .use(i18n)
  .provide <Crypto> ('crypto', globalThis.crypto)
  .mount('#app')
