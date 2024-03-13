import axios  from 'axios'
import { LoginResponse } from '@/api/types'

export const authentificate =  async (login: string, password: string): Promise <LoginResponse | null> => {
  try {
    const response = await axios.request<{login: string, password: string}, LoginResponse>({
      url: '/api/auth/login',
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      data: {
        login,
        password
      }
    })

    return response
  } catch (err) {
    console.error(err)
    return null
  }
  
}
