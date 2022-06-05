<template>
  <div>
    <h2>
      {{greeting}}
    </h2>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'

export default defineComponent({
  data: () => {
    return {
      data: {
        greeting: 'Hello Devices View!'
      }
    }
  }
})
</script>
