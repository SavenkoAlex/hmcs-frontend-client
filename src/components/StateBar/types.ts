import { 
  UserRole,
  StreamRole,
  User,
  UserAccount
 } from '@/types/global'


export type Data = {
  userAccountId: string | null,
  userId: string | null,
  live: boolean,
  isStreaming: boolean,
  isRequestActive: boolean,
  user: null | User,
  account: null | UserAccount,
  isCameraMuted: boolean,
  isMicMuted: boolean
}

export type BarConfiguration = {
  [key in StreamRole]: StateBarElements[]
}

export const enum StateBarElements {
  DEVICES = 'devices',
  JOIN_REQ = 'joinreq',
  CAMERA = 'camera',
  MIC = 'mic',
  INCREASE = 'increase',
  AMOUNT = 'amount',
  LIVE = 'live',
  FEE = 'fee',
  STREAM = 'stream',
  EMPTY = 'empty'
}

export const BarConfigutations: BarConfiguration = {
  [StreamRole.SUBSCRIBER]: [
    StateBarElements.DEVICES, 
    StateBarElements.CAMERA,
    StateBarElements.MIC,
    StateBarElements.JOIN_REQ, 
    StateBarElements.INCREASE,
    StateBarElements.AMOUNT
  ],
  [StreamRole.PUBLISHER]: [
    StateBarElements.STREAM,
    StateBarElements.CAMERA,
    StateBarElements.MIC,
    StateBarElements.DEVICES, 
    StateBarElements.LIVE,
  ],
  [StreamRole.PUBLISHER_OFFLINE]: [
    StateBarElements.DEVICES, 
    StateBarElements.STREAM,
  ],
  [StreamRole.OBSERVER]: [
    StateBarElements.JOIN_REQ, 
    StateBarElements.INCREASE,
    StateBarElements.FEE,
    StateBarElements.EMPTY,
    StateBarElements.LIVE,
    StateBarElements.AMOUNT,
  ]
}
