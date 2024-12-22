import {
  mapActions,
  mapGetters
} from 'vuex'

import {
  inject
} from 'vue'

/** types */
import { States } from '@/types/store'
import { UserRole, supKey, pubKey, chatKey} from '@/types/global'

/** services */
import { PublisherStreamHandler } from '@/services/webrtc/webrtcPublisher'
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'
import { ChatHandler } from '@/services/webrtc/webrtcDataExchange'

/** router */

export const userMixin = {
  
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

      const pHandler = inject <PublisherStreamHandler | null> (pubKey, null)
      const sHandler = inject <SubscriberStreamHandler | null> (supKey, null)

      pHandler?.destroyStream()
      sHandler?.leave()
      
      this.setUser(null)
      this.setUserProperty({isAuthentificated: false})
      localStorage.clear()
      location.replace('/')
    }
  }
}
