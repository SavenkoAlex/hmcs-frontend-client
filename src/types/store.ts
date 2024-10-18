import { Maybe, MediaDevice } from '@/types/global'

export const isAuthentificated: string = import.meta.env.VITE_IS_AUTHENTIFICATED as string || 'isa'
export const userData: string = import.meta.env.VITE_USER_DATA || 'usa'
export const amount: string = import.meta.env.VITE_AMOUNT || 'ama'
export const webrtcSessionId = import.meta.env.VITE_WEBRTC_SESSION_ID || 'vs'
export const chatSessionId = import.meta.env.VITE_CHAT_SESSION_ID || 'sch'

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

