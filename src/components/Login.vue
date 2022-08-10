<template>
  <div class="loginFormContainer">
    <va-form style="width: 300px" tag="form" @submit.prevent="login">
     <va-input
      v-model="email"
      label="Email"
    />
    <va-input
      v-model="password"
      label="Password"
    />
    <va-button type="submit" class="mt-2">
      Login
    </va-button>
    </va-form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { VaForm, VaInput } from 'vuestic-ui'

import loginApi from '../api/login'

export default defineComponent({
  components: {
    'va-form': VaForm,
    'va-input': VaInput
  },
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
