import {
  User
} from '@/typings/common'



export type LoginResponse = {
  user: User,
  accessToken: string 
}
