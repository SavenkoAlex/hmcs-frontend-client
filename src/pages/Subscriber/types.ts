
export type Peer = {
  id: string
  type: string,
  description: string
}

export type PeerList = {
  streaming: 'striing',
  list: Peer[]
}
