import { UserAccount } from '@/types/global'
import axios /* { AxiosResponse } */ from 'axios'

const intercepter = axios.interceptors.request.use(function(config) {
  const token =  localStorage.getItem('accessToken')
  
  if (token) {
    config.headers= { ...config.headers, ...{'authorization': token }}
  }

  return config
})

export default {

  getAccount: async (id: string): Promise <UserAccount | null> => {
    const response = await axios.request<UserAccount>({
      url: '/api/account/userAccount',
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      data: {
        id,
      } 
    }).catch(err => {
      console.error(err)
      return null
    })

    const account: UserAccount = (response as { data: UserAccount}).data
    return account
  },
}
