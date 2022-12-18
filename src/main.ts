import { createApp } from 'vue'
import App from './App.vue'
import vueCookies from 'vue-cookies'
import router from './router'
// import { store, keyMain, keyDevices } from './store'
import { VuesticPlugin } from 'vuestic-ui'
import 'vuestic-ui/dist/vuestic-ui.css'
import { createApolloProvider } from '@vue/apollo-option'
import { apolloClient, restClient } from './apollo/apolloClient'

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
  clients: {
    restClient
  }
})

createApp(App)
  // .use(store, keyMain, keyDevices)
  .use(apolloProvider)
  .use(router)
  .use(VuesticPlugin)
  .use(vueCookies)
  .mount('#app')
