import { User } from '@/types/global'

export type UserDataProfile = {
  userData: User | null,
  repeatPassword: string,
  newPassword: string,
  penIconPath: string,
  plusIcon: string
}

export const MIN_AMOUNT = 100
