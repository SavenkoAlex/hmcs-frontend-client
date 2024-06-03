import {
  defineComponent,
  PropType,
  VNode,
  Transition,
  ref
} from 'vue'

import './Video.scss'

export default defineComponent({

  name: 'BaseVideo',

  props: {
    /** stream */
    srcObject: {
      type: Object as PropType <MediaStream | undefined>,
      required: true
    },
    /** autoplay */
    autoplay: {
      type: Boolean as PropType <boolean>,
      default: true
    },
    /** playsinline */
    playsinline: {
      type: Boolean as PropType <boolean>,
      default: true
    },
    /** not supported text */
    notSupprtedText: {
      type: String as PropType <string>,
      default: 'Video is not supported'
    },

    pictureInPictureMode: {
      type: Boolean as PropType <boolean>,
      default: false
    }
  },

  computed: {
    class () {
      return this.pictureInPictureMode ? 'picture-in-picture' : 'base-video'
    }
  },

  data() {
    return {
      xInitial: 0,
      yInitial: 0,
      xFinite: 0,
      yFinite: 0
    }

  },

  setup () {
    const videoWrapper = ref <HTMLDivElement> ()

    return {
      videoWrapper
    }
  },

  methods: {
    onDrag (event: MouseEvent) {
      event.preventDefault()
      if (!this.videoWrapper) {
        return
      }
      this.videoWrapper.onmouseup = this.stopDrag
      this.xFinite = event.clientX
      this.yFinite = event.clientY
      this.videoWrapper.onmousemove = this.dragElement 
    },

    dragElement (event: MouseEvent) {
      event.preventDefault()
      if (!this.videoWrapper) {
        return
      }

      this.xInitial = this.xFinite - event.clientX
      this.yInitial = this.yFinite - event.clientY
      this.xFinite = event.clientX
      this.yFinite = event.clientY
      this.videoWrapper.style.top = (this.videoWrapper.offsetTop - this.yInitial) + 'px'
      this.videoWrapper.style.left = (this.videoWrapper.offsetLeft - this.xInitial) + 'px'
    },

    stopDrag () {
      if (!this.videoWrapper) {
        return
      }

      this.videoWrapper.onmouseup = null
      this.videoWrapper.onmousemove = null
    }
  },

  render (): VNode {
    return  <Transition name='video'>
      <div 
        class={this.class}
        onMousedown={ (event: MouseEvent) => this.pictureInPictureMode ? this.onDrag(event) : undefined}  
        ref='videoWrapper'
      >
        <video 
          srcObject={this.srcObject} 
          autoplay
          playsinline
          onMousedown={() => console.log('!!!')}
        > 
          { this.notSupprtedText }
        </video>
      </div>
    </Transition>
  } 
})
