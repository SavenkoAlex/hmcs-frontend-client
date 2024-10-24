import { User, Room } from '@/types/global'

export type StreamsData = {
  users: User[]
  rooms: Record <number, Room>,
  userStreams: { user: User, isOnline: boolean} [] | []
}
