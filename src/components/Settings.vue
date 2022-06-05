
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
      greeting: 'Hello Settings View!'
    }
  }
})
</script>
