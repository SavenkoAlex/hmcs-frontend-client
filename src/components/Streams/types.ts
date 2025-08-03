import { User, Room } from '@/types/global'

export type ExtendedUser = {
  user: User,
  isOnline: boolean
}

export type StreamsData = {
  users: User[]
  rooms: Record <number, Room>,
  userStreams: ExtendedUser[],
  isLoading: boolean
}

