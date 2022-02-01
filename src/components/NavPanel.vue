<template>
<va-navbar color="primary" shape class="mb-2">
    <template #left>
      <router-link to="/Login">
        <va-navbar-item class="nav-item">
          Log In
        </va-navbar-item>
      </router-link>
    </template>
    <template #right>
      <router-link to="/About">
        <va-navbar-item class="nav-item">About</va-navbar-item>
      </router-link>
    </template>
  </va-navbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  //
})
</script>

<style scoped>
  .nav-item {
    color: white
  }
</style>
