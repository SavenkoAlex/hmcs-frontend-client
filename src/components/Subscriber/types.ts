import { User, UserAccount } from '@/types/global'

export type Data = {
  publisher: User | null,
  publisherAccount: UserAccount | null,
  isPublisherAvailable: boolean
}
