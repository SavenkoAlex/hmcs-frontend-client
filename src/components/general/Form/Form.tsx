import {
  defineComponent,
  VNode,
  provide
} from 'vue'

/** types */
import { ErrorBucket } from '@/types/global'
/** style*/
import '@/components/general/Form/Form.scss'

export default defineComponent({

  name: 'Form',

  setup () {
    const errorBucket = provide <ErrorBucket> ('errorBucket', {})
    
    return {
      errorBucket
    }
  },

  watch: {
    errorBucket (value) {
      for (const item of Object.values(value)) {
        if (item) {
          this.$emit('errorbucket', true)
          return
        }
      }

      this.$emit('errorbucket', false)
    }
  },

  render (): VNode {
    return <div class='form-general'>
        {
          this.$slots.header?.()
        }
        <form> { this.$slots.default?.()} </form>
        { 
          this.$slots?.footer?.()
        }
    </div>
  }
})
