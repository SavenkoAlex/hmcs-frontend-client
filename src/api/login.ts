import axios, { AxiosResponse } from 'axios'

export default {
  login: async (email: string, password: string): Promise <unknown> => {
    const response = await axios.request({
      url: '/api/auth/login',
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      data: {
        email,
        hashPassword: password
      }
    })

    return response as AxiosResponse <unknown, unknown>
  }
}
