/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent, DefineComponent } from 'vue'
  const component: DefineComponent<TP, {}, any>
  export default component
}

declare module '*.svg' {
  import { DefineComponent } from 'vue'
  const content: DefineComponent
  export default content
}

declare module 'videojs-fetch-flv' {
  export * from 'video.js'
}

declare namespace tp {
  export type UserCredentials = {
    email: string | null,
    password: string | null
  }
 

  export const enum StoreKey {
    MAIN = 'main',
    DEVICES = 'devices'
  }
}
