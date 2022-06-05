
<template>
  <div>
    <h1>
        {{ greeting }}
    </h1>
  </div>
</template>

<script lang='ts'>

import { defineComponent } from 'vue'

export default defineComponent({
  data: () => {
    return {
      greeting: 'Hello Plan View!'
    }
  }
})

</script>
