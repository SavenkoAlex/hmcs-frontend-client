<template>
  <div class="loginFormContainer">
    <va-form
      tag="form"
      @submit.prevent="send"
    >
      <va-input
        label="username"
        v-model="email"
      />
      <va-input
        class="mt-3"
        type="password"
        label="password"
        v-model="password"
      />
      <va-button type="submit" class="mt-3">
        Login
      </va-button>
    </va-form>
  </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import authApi from '../api/login'

export default defineComponent({
  name: 'LoginForm',

  data () {
    return {
      email: '',
      password: ''
    }
  },

  methods: {
    send () {
      authApi.login(this.email, this.password)
    }
  }
})

</script>

<style scoped>
  .loginFormContainer {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  form {
    display: flex;
    flex-direction: column;
    margin-top: 15%
  }
  input {
    flex: 1
  }
</style>
