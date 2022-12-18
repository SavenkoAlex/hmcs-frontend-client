<template>
  <div>
    <h2> Test page </h2>
    <base-icon
      :src="src"
      :iconColor="'red'"
    />
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ShuttleSrc from '../../assets/icons/space-shuttle-svgrepo-com.svg'

const src = ShuttleSrc

</script>
