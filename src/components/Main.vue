<template>
    <div class="main">
      <h2> {{ defaultMessage }} </h2>
      <va-input label="enter new mewssage" v-model="text">
      </va-input>
      <va-button @click="setDefaultMessage"> Cnange message </va-button>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from '@/store'

export default defineComponent({
  setup () {
    // eslint-disable-next-line no-undef
    const store = useStore(tp.StoreKey.MAIN)
    const state = store.state
    const text = ''

    return {
      text,
      defaultMessage: computed(() => state.defaultStoreMessage),
      setDefaultMessage: () => {
        store.commit('SET_DEFAULT_STORE_MESSAGE', { value: text })
      }
    }
  }
})
</script>

<style scoped>
  .main {
    display: flex;
    flex-direction: column;
  }
</style>
