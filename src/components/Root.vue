<template>
  <div class="content">
      <Main/>
      <Footer/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Main from '@/components/Main.vue'
import Footer from '@/components/Footer.vue'

export default defineComponent({

  components: {
    Main,
    Footer
  },

  setup () {
    return {
    }
  }
})
</script>
