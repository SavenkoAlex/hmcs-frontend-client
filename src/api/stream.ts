import axios /* { AxiosResponse } */ from 'axios'

export type StreamPublisher = {
  publisher: {
    app: string
    audio: {
      channels: number
      codec: string
      profile: string
      samplerate: number
    }
    channels: number
    samplerate: number
    bytes: number
    clientId: string,
    connectCreated: string
    ip: string
    stream: string
    video: {
      codec: string
      fps: number
      height: number
      level: number
      profile: string
      width: number
    }
  }
}

export type Stream = {
  live: {
    qwerty1: StreamPublisher
  }
} | null

export default {

  getStreams: async (): Promise <Stream> => {
    const response = await axios.request({
      url: 'streams',
      method: 'GET'
    }).catch(err => {
      console.error(err)
    })

    const streams: Stream = (response as { data: Stream}).data

    if (typeof streams === undefined) {
      // console.log('no stream available ', streams)
      return null
    }

    return streams
  },

  getPublisher: async (id: string): Promise<unknown> => {
    const response = await axios.request({
      url: `streams/${id}`,
      method: 'GET'
    })

    console.log(response)

    if (response.data) {
      return response.data
    }
  },

  getPublisherStream: async (id: string): Promise<unknown> => {
    const response = await axios.request({
      url: `live/${id}/index.m3u8`,
      method: 'GET'
    })

    console.log(response)

    if (response.data) {
      return response.data
    }
  }
}
