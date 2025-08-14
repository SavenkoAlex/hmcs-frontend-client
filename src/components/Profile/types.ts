import { User } from '@/types/global'

export type UserDataProfile = {
  userData: User | null,
  repeatPassword: string,
  newPassword: string,
  plusIconPath: string,
}

export const MIN_AMOUNT = 100
