<template>
  <div class="content">
      <MainBody/>
      <Footer/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MainBody from './MainBody.vue'
import Footer from './Footer.vue'

export default defineComponent({

  components: {
    MainBody,
    Footer
  },

  setup () {
    return {
    }
  }
})
</script>

