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

type StoreModule <T extends States> = T extends States.USER   
  ? Store <UserState>
  : T extends States.APP
    ? Store <AppState>
    : never

//TODO: refactor return signature
function useStore  (key: States): StoreModule<typeof key>{
  switch (key) {

    case States.USER : {
      return getStore (userStateKey)
    }

    case States.APP : {
      return getStore (appStateKey)
    }

    default: {
      return getStore (appStateKey)
    }
  }
}

export { 
  store,
  userStateKey, 
  appStateKey,
  useStore,
}
