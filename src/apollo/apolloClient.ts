import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client/core'

import { RestLink } from 'apollo-link-rest'

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:3001'
})

const restLink = new RestLink({
  uri: 'http://localhost:3000',
  bodySerializers: {
    fileEncode: (data: FormData, headers: Headers) => {
      headers.set('Accept', '*/*')
      return { body: data, headers }
    }
  }
})

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache
})

export const restClient = new ApolloClient({
  link: restLink,
  cache
})
