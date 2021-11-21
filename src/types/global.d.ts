import { VNode, DirectiveBinding } from '@vue/runtime-core'

declare global {

  export interface ClickOutsideObject extends EventTarget {
    clickOutsideEvent: (event: Event) => unknown,
    contains: (target: EventTarget | null) => boolean,
    context: {
      [key: string]: (event: Event) => unknown
    }
  }

  export interface Binding extends DirectiveBinding{
    expression: string
  }

  export interface Vnode extends VNode{
    context: {
      [key: string]: (event: Event) => unknown
    }
  }
}
