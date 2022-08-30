<template>
  <div id="app">
    <div id="nav">
      <va-app-bar>
        <router-link to="/">
          <va-button icon="home" color="#fff" flat :rounded="false"></va-button>
        </router-link>
        <va-spacer />
        <router-link to="/login">
          <va-button  color="#fff" flat :rounded="false">Login</va-button>
        </router-link>
      </va-app-bar>
    </div>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup () {
    return {}
  }
})

</script>

<style scoped>
#app {
  flex-direction: column;
}
.content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
}

</style>
