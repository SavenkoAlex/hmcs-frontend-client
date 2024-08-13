import { UserLinks } from '@/router/types'

export type Data = {
  links: UserLinks['user'] | UserLinks['worker'] | UserLinks['anonymous']
}
