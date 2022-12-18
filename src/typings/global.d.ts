/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.svg' {
  import { DefineComponent } from 'vue'
  const content: DefineComponent
  export default content
}

declare namespace tp {
  export type UserCredentials = {
    email: string | null,
    password: string | null
  }

  export type User = {
    id: string | null,
    token: string | null
  }

  export const enum StoreKey {
    MAIN = 'main',
    DEVICES = 'devices'
  }
}