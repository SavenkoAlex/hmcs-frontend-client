import { MediaDevice } from '@/types/global' 

export type DeviceList = {
  cameras: MediaDevice[],
  mics: MediaDevice[]
}

export type Data = {
  isModalVisible: boolean,
  devicesValidationError: string | null | false,
  cameras: MediaDevice[],
  mics: MediaDevice[]
}

