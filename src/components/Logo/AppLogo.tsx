// AuraLiveSphereWithProps.tsx
import { defineComponent, computed, PropType } from 'vue'
import type { AuraLiveSphereProps, SphereItem, Particle } from '@/components/Logo/types'

/**style */
import './AppLogo.scss'

export default defineComponent({
  name: 'AuraLiveSphereWithProps',
  
  props: {
    particlesCount: {
      type: Number,
      default: 8
    },
    sphereSize: {
      type: Number,
      default: 10
    },
    animationSpeed: {
      type: Number,
      default: 16
    },
    theme: {
      type: String as PropType<'light' | 'dark'>,
      default: 'dark',
      validator: (value: string) => ['light', 'dark'].includes(value)
    },
    showInfo: {
      type: Boolean,
      default: true
    },
    interactive: {
      type: Boolean,
      default: true
    }
  },
  
  setup(props) {

    // Вычисляемые стили на основе пропсов
    const sphereStyle = computed(() => ({
      width: `${props.sphereSize}px`,
      height: `${props.sphereSize}px`,
      animationDuration: `${props.animationSpeed}s`
    }))
    
    const glowStyle = computed(() => ({
      width: `${props.sphereSize + 67}px`,
      height: `${props.sphereSize + 67}px`
    }))
    
    // Генерация частиц
    const generateParticles = computed<Particle[]>(() => {
      const particles: Particle[] = []
      const positions = [
        { top: 10, left: 50 },
        { top: 20, left: 20 },
        { top: 50, left: 10 },
        { top: 80, left: 20 },
        { top: 90, left: 50 },
        { top: 80, left: 80 },
        { top: 50, left: 90 },
        { top: 20, left: 80 }
      ]
      
      for (let i = 0; i < props.particlesCount; i++) {
        particles.push({
          id: i,
          top: positions[i % positions.length].top,
          left: positions[i % positions.length].left,
          delay: -i
        })
      }
      
      return particles
    })
    
    // Генерация элементов сферы
    const generateSphereItems = computed<SphereItem[]>(() => {
      const items: SphereItem[] = []
      const totalItems = 32
      const half = totalItems / 2
      
      for (let i = 1; i <= totalItems; i++) {
        if (i <= half) {
          const angle = (360 / totalItems) * i
          const opacity = 0.1 + (i / half) * 0.9
          items.push({
            id: i,
            transform: `rotateY(${angle}deg)`,
            borderColor: `rgba(168, 94, 238, ${opacity})`
          })
        } else {
          const angle = (360 / totalItems) * i
          const index = i - half
          const opacity = 0.1 + (index / half) * 0.9
          items.push({
            id: i,
            transform: `rotateX(${angle}deg)`,
            borderColor: `rgba(200, 130, 255, ${opacity})`
          })
        }
      }
      
      return items
    })
    
    const handleClick = (e: MouseEvent) => {
      if (props.interactive) {
        createWaveEffect(e.clientX, e.clientY)
      }
    }
    
    const createWaveEffect = (x: number, y: number) => {
      const wave = document.createElement('div')
      wave.className = 'wave-effect'
      wave.style.left = `${x}px`
      wave.style.top = `${y}px`
      document.body.appendChild(wave)
      
      setTimeout(() => wave.remove(), 1000)
    }
    
    return () => (
      <div 
        class={['aura-live-container', `theme-${props.theme}`]} 
        onClick={handleClick}
        style={{ cursor: props.interactive ? 'pointer' : 'default' }}
      >
        <div class="sphere-container">
          <div class="glow" style={glowStyle.value}></div>
          
          <div class="particles">
            {generateParticles.value.map(particle => (
              <div
                key={particle.id}
                class="particle"
                style={{
                  top: `${particle.top}%`,
                  left: `${particle.left}%`,
                  animationDelay: `${particle.delay}s`
                }}
              />
            ))}
          </div>
          
          <div class="sphere" style={sphereStyle.value}>
            {generateSphereItems.value.map(item => (
              <i
                key={item.id}
                style={{
                  transform: item.transform,
                  borderColor: item.borderColor,
                  width: `${props.sphereSize}px`,
                  height: `${props.sphereSize}px`
                }}
              />
            ))}
          </div>
          
          <div class="aura-live">
            <span class="aura-text">Aura</span>
            <span class="live-text">Live</span>
          </div>
        </div>
        
        {props.showInfo && (
          <div class="info">
            <div class="info-text">Purple Aura Sphere | #a85eee</div>
            {props.interactive && (
              <div class="info-subtext">Click for wave effect</div>
            )}
          </div>
        )}
      </div>
    )
  }
})
