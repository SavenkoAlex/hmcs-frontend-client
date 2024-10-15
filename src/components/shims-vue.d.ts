import { Router, Route } from 'vue-router'
import { ComponentCustomProperties } from 'vue'
import { useToast } from 'vue-toastification'
export {}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (data: string) => string,
    $router: Router,
    $route: Route
  }
}
