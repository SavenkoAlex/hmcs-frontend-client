// types/sphere.ts
export interface SphereItem {
  id: number
  transform: string
  borderColor: string
}

export interface Particle {
  id: number
  top: number
  left: number
  delay: number
}

export interface AuraLiveSphereProps {
  particlesCount?: number
  sphereSize?: number
  animationSpeed?: number
  theme?: 'light' | 'dark'
}
