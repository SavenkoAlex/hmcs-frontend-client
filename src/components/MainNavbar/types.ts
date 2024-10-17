import { UserLinks } from '@/router/types'
import { UserRole } from '@/types/global'

export type Data = {
  links: UserLinks[UserRole.USER] | UserLinks[UserRole.WORKER] | UserLinks[UserRole.ANONYMOUS]
}
