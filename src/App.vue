<template>
  <div id="app">
    <router-view name='header'></router-view>
    <main>
      <transition mode="out-in" :duration="250">
        <router-view/>
      </transition>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, Transition } from 'vue'

export default defineComponent({
  components: {
    Transition
  }
})

</script>

<style lang="stylus">
#app
  font-family Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
  margin-top 60px
</style>
