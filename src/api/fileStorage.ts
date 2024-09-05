import axios, { AxiosResponse } from 'axios'

export default {
  saveFile: async (file: FormData): Promise <unknown> => {
    const response = await axios.request({
      url: '/api/file/store',
      method: 'post',
      headers: {
        'content-type': 'multipart/form-data'
      },
      data: file
    })

    return response
  }
}
