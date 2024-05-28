import { 
  UserRole,
  User,
  UserAccount
 } from '@/types/global'


export type Data = {
  userAccountId: string | null,
  userId: string | null,
  live: boolean,
  isStreamAvailable: boolean,
  isRequestActive: boolean,
  user: null | User,
  account: null | UserAccount,
}

export type BarConfiguration = {
  [key in Exclude<UserRole, UserRole.ANONYMOUS>]: StateBarElements[]
}

export const enum StateBarElements {
  JOIN_REQ = 'joinreq',
  CAMERA = 'camera',
  INCREASE = 'increase',
  AMOUNT = 'amount',
  LIVE = 'live',
  FEE = 'fee',
  STREAM = 'stream',
}

export const BarConfigutations: BarConfiguration = {
  [UserRole.USER]: [
    StateBarElements.LIVE, 
    StateBarElements.JOIN_REQ, 
    StateBarElements.CAMERA,
    StateBarElements.INCREASE,
    StateBarElements.FEE 
  ],
  [UserRole.WORKER]: [
    StateBarElements.LIVE,
    StateBarElements.CAMERA,
    StateBarElements.STREAM,
    StateBarElements.JOIN_REQ,
  ]
}
