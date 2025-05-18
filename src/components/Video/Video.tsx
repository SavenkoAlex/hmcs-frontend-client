import {
  defineComponent,
  PropType,
  VNode,
  Transition,
  ref,
  useTemplateRef
} from 'vue'

import './Video.scss'

export default defineComponent({

  name: 'BaseVideo',

  emits: {
    'dbclick': (event: MouseEvent) => {
      return event instanceof MouseEvent
    }
  },

  props: {
    /** stream */
    srcObject: {
      type: Object as PropType <MediaStream | undefined>,
      default: undefined
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
    const videoNode = useTemplateRef <HTMLMediaElement> ('video')

    return {
      videoWrapper,
      videoNode
    }
  },

  watch: {
    srcObject (newValue: MediaStream) {
      if (!newValue) {
        return
      }
      this.setVideoSrc()
    }
  },

  methods: {
    onDrag (event: MouseEvent) {
      event.preventDefault()
      if (!this.videoWrapper) {
        return
      }
      this.videoWrapper.onpointerleave = this.stopDrag
      this.xFinite = event.clientX
      this.yFinite = event.clientY
      this.videoWrapper.onpointermove = this.dragElement 
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
    },

    setVideoSrc () {
      if (!this.videoNode || !this.srcObject) {
        return
      }

      this.videoNode.onloadedmetadata = () => {
        this.videoNode?.play()
      }
      this.videoNode.srcObject = this.srcObject
    }
  },

  mounted () {
    this.setVideoSrc()
  },

  render (): VNode {
    return  <Transition name='video'>
      <div 
        class={this.class}
        onPointerdown={ (event: MouseEvent) => this.onDrag(event)}  
        onDblclick={ (event: MouseEvent) => this.$emit('dbclick', event)}
      >
        <video 
          ref={'video'}
          autoplay
          playsinline
          //onMousedown={() => console.log('!!!')}
        > 
          { this.notSupprtedText }
        </video>
      </div>
    </Transition>
  } 
})
