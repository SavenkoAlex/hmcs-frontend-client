<template>
  <div id="app">
    <Header/>
    <Main/>
    <Footer/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Main from '@/components/Main.vue'
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'

export default defineComponent({
  components: {
    Main,
    Footer,
    Header
  }
})

</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
}
</style>
