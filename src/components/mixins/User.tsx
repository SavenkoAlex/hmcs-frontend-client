import {
  mapActions,
  mapGetters
} from 'vuex'

import {
  inject
} from 'vue'

/** types */
import { States } from '@/types/store'
import { UserRole, chatKey, videoHandlerKey} from '@/types/global'

/** services */
import { PublisherStreamHandler } from '@/services/webrtc/webrtcPublisher'
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'
import { ChatHandler } from '@/services/webrtc/webrtcDataExchange'

/** router */
import router from '@/router'

export const userMixin = {
  
  events: {
    logout: (): void => {
      return
    }
  },

  computed: {
    ...mapGetters(States.USER, {
      userRole: 'userRole'
    })
  },

  methods: {
    ...mapActions(States.USER, {
      setUser: 'setUser',
      setUserProperty: 'setUserProperty'
    }),

    logout (role: UserRole) {
      this.setUser(null)
      this.setUserProperty({isAuthentificated: false})
      localStorage.clear()
      router.replace({name: 'login'})
    }
  }
}
