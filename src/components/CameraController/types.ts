import { MediaDevice } from '@/types/global' 

export type Data = {
  devices: MediaDevice[],
  isModalVisible: boolean,
  devicesValidationError: string | null | false
}
