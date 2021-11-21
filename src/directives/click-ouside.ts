import { ObjectDirective } from '@vue/runtime-core'

const objectDirective: ObjectDirective = {
  mounted: function (el, binding, vnode) {
    el.clickOutsideEvent = function (event: Event) {
      if (!(el === event.target || el.contains(event.target)) && vnode) {
        // and if it did, call method provided in attribute value
        (vnode.appContext as any)[binding.value](event)
      }
    }
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted: function (el: ClickOutsideObject): void {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  }
}

export default objectDirective
