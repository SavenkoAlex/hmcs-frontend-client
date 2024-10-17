import {
  mapActions
} from 'vuex'

/** types */
import { States } from '@/types/store'

/** router */
import { useRouter } from 'vue-router'

export const userMixin = {
  
  methods: {
    ...mapActions(States.USER, {
      setUser: 'setUser',
      setUserProperty: 'setUserProperty'
    }),

    logout () {
      this.setUser(null)
      this.setUserProperty({isAuthentificated: false})
      localStorage.clear()
      location.replace('/')
    }
  }
}
