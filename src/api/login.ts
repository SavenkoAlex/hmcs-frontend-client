import axios  from 'axios'
import { LoginResponse } from '@/api/types'

/** types */
import { RegisterUserData } from '@/types/global'

/** helpers */
import { printf } from '@/helpers/helper'

export const authentificate =  async (login: string, password: string): Promise <LoginResponse | null> => {
  try {
    const response = await axios.request<{login: string, password: string},
     {data: LoginResponse}>({
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

    return response.data
  } catch (err) {
    console.error(err)
    return null
  }
  
}

export const register = async (data: RegisterUserData): Promise <boolean> => {
  try {
    const response = await axios.request({
      url: '/api/auth/register',
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      data,
    })

    return response.status === 200
  } catch (err) {
    printf(err, 'error')
    return false
  }
}
