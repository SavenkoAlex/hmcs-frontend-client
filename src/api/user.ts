import { User } from '@/types/global'
import axios /* { AxiosResponse } */ from 'axios'

const intercepter = axios.interceptors.request.use(function(config) {
  const token =  localStorage.getItem('access-token')
  
  if (token) {
    config.headers= { ...config.headers, ...{'authorization': token }}
  }

  return config
})

export default {

  getUsers: async (): Promise <User[]> => {
    const response = await axios.request<User[]>({
      url: '/api/auth/users',
      method: 'GET',
    }).catch(err => {
      console.error(err)
      return []
    })

    const users: User[] = (response as { data: User[]}).data

    return users
  },

  getUser: async (userId: string): Promise <User | null> => {

    if (!userId) {
      return null
    }

    const response = await axios.request<User>({
      url: `api/auth/user/${userId}`,
      method: 'GET',
    }).catch(err => {
      console.error(err)
      return null
    })

    if (!response?.data) {
      return null
    }
    
    return response.data
  }
}
