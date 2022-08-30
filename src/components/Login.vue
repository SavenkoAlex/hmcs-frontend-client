<template>
  <div class="loginFormContainer">
    <va-form style="width: 300px" tag="form" @submit.prevent="login">
     <va-input
      v-model="credentials.email"
      label="Email"
    />
    <va-input
      v-model="credentials.password"
      label="Password"
    />
    <va-button type="submit" class="mt-2">
      Login
    </va-button>
    </va-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { VaForm, VaInput } from 'vuestic-ui'
import { useStore } from '@/store'

export default defineComponent({
  components: {
    'va-form': VaForm,
    'va-input': VaInput
  },

  setup () {
    const store = useStore()
    const credentials = reactive({
      email: '',
      password: ''
    })

    function login (): void {
      store.dispatch('login', credentials)
    }

    return {
      credentials,
      login
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
