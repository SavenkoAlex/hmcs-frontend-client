import { Router } from 'vue-router'
import { ComponentCustomProperties } from 'vue'
export {}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (data: string) => string,
    $router: Router
  }
}
