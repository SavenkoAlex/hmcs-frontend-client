<template>
<img
  svg-inline
  :src="src"
  :alt="alt"
  :fill="iconColor"
  :width="width"
  :height="height"
/>
</template>

<script setup lang="ts">
import { defineProps, withDefaults } from 'vue'
export interface BaseIconProps {
  src: string,
  alt?: string,
  iconColor?: string,
  width?: number,
  height?: number
}

const props = withDefaults(defineProps<BaseIconProps>(), {
  alt: 'icon',
  iconColor: 'currentColor',
  width: 110,
  height: 81
})
</script>
