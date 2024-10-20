import { Maybe, MediaDevice } from '@/types/global'

export const isAuthentificated = import.meta.env.VITE_IS_AUTHENTIFICATED || 'isa'
export const userData = import.meta.env.VITE_USER_DATA || 'usa'
export const amount = import.meta.env.VITE_AMOUNT || 'ama'
export const webrtcSessionId = import.meta.env.VITE_WEBRTC_SESSION_ID || 'vs'
export const chatSessionId =  import.meta.env.VITE_CHAT_SESSION_ID || 'sch'

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

