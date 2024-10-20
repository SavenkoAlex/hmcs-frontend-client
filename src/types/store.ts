import { Maybe, MediaDevice } from '@/types/global'
import { getEnvVar } from '@/helpers/helper'
export const isAuthentificated = getEnvVar('VITE_IS_AUTHENTIFICATED', 'isa')
export const userData = getEnvVar('VITE_USER_DATA','usa')
export const amount = getEnvVar('VITE_AMOUNT', 'ama')
export const webrtcSessionId = getEnvVar('VITE_WEBRTC_SESSION_ID', 'vs')
export const chatSessionId = getEnvVar('VITE_CHAT_SESSION_ID','sch')

export interface UserState {
  accessToken: Maybe<string>,
  amount: number,
  isAuthentificated: boolean,
  userData: string | null
}

export interface AppState {
  webrtcSessionId: Maybe<string | number>
  chatSessionId: Maybe<string | number>,
  devices: Record<string, MediaDevice>
}

export const enum States {
  'USER' = 'user',
  'APP' = 'app'
}

export interface State {
  [States.USER]: UserState,
  [States.APP]: AppState
}

