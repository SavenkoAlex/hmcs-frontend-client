import { UserLinks } from '@/router/types'
import { UserRole } from '@/types/global'
import { JsxElement } from 'typescript'

export type Data = {
  links: UserLinks[UserRole.USER] | UserLinks[UserRole.WORKER] | UserLinks[UserRole.ANONYMOUS]
}

export type MenuItem = {
  label?: string
  to: string
  icon?: string
}
