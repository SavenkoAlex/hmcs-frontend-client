import { User } from '@/types/global'
import axios /* { AxiosResponse } */ from 'axios'

export default {

  getUsers: async (): Promise <User[]> => {
    const response = await axios.request<User[]>({
      url: '/api/auth/users',
      method: 'GET',
    }).catch(err => {
      console.error(err)
    })

    const users: User[] = (response as { data: User[]}).data

    return users
  }
}
