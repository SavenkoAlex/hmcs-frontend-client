import { createStore, Store, useStore as getStore } from 'vuex'
import { UserState, AppState, State, States } from '@/types/store'

/** states */
import { app, appStateKey } from '@/store/modules/app'
import { user, userStateKey } from '@/store/modules/user'

const store = createStore<State>({
  modules: {
    user,
    app
  }
})

//TODO: refactor return signature
function useStore  <T extends States, R = T extends States.USER ? Store <UserState> : Store <AppState>> (key: States): R {
  switch (key) {

    case States.USER : {
      return getStore <UserState>(userStateKey) as R
    }

    case States.APP : {
      return getStore <AppState>(appStateKey) as R
    }

    default: {
      return getStore <AppState>(appStateKey) as R
    }
  }
}

export { 
  store,
  userStateKey, 
  appStateKey,
  useStore,
}
