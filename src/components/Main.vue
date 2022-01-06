<template>
  <div id="loginForm">
    <h1> Hello page </h1>
    <label for="login">e-mail</label>
    <input type="email" name="login" v-model="email" placeholder="your email">
    <label for="password">Password</label>
    <input type="password" name="password" v-model="password">
    <input id="submit" type="submit" value="Submit" @click="login">
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import loginApi from '../api/login'

export default defineComponent({

  data () {
    return {
      email: '',
      password: ''
    }
  },

  methods: {
    login (): void {
      loginApi.login(this.email, this.password)
    }
  }
})
</script>

<style scoped>
  #loginForm {
    max-width: 200px;
    max-height: 300px;
    padding-left: calc(50% - 100px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }
  #submit {
    padding: 2px 52px;
    margin: 10px;
  }
</style>
