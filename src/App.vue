<template>
  <div id="app"> <Main/></div>
  <Footer/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Main from '@/components/Main.vue'
import Footer from '@/components/Footer.vue'

export default defineComponent({
  components: {
    Main,
    Footer
  }
})

</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
}
</style>
