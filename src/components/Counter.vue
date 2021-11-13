<script lang="ts">

import { defineComponent } from 'vue'

export default defineComponent({

  data () {
    return {
      valueNumber: 1
    }
  },

  methods: {

    getFormattedNumber (): string {
      return `Your total number is ${this.valueNumber}`
    },

    increase (): void {
      this.valueNumber += 1
    },

    decrease (): void {
      this.valueNumber -= 1
    }
  }
})

</script>

<template>
  <div id='app'>
    <fieldset>
      <legend>{{ valueNumber }}</legend>
      <button @click="increase"> Increase </button>
      <button @click="decrease"> Decrease </button>
    </fieldset>
  </div>
</template>
