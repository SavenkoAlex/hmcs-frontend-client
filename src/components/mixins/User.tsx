import {
  mapActions,
  mapGetters
} from 'vuex'

/** types */
import { States } from '@/types/store'
import { UserRole } from '@/types/global'

/** router */

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
      
    }
  }
}
