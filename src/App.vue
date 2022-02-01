<template>
  <NavPanel/>
  <div id="app"> <Main/></div>
  <Footer/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Main from '@/components/Main.vue'
import NavPanel from '@/components/NavPanel.vue'
import Footer from '@/components/Footer.vue'

export default defineComponent({
  components: {
    Main,
    NavPanel,
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
