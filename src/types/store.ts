import { Maybe } from '@/types/global'

export const isAuthentificated: string = import.meta.env.IS_AUTHENTIFICATED as string || 'isa'
export const userData: string = import.meta.env.USER_DATA || 'usa'
export const amount: string = import.meta.env.AMOUNT || 'ama'
export const webrtcSessionId = import.meta.env.WEBRTC_SESSION_ID || 'vs'
export const chatSessionId = import.meta.env.CHAT_SESSION_ID || 'sch'

export interface UserState {
  accessToken: Maybe<string>,
  amount: number,
  isAuthentificated: boolean,
  userData: string | null
}

export interface AppState {
  webrtcSessionId: Maybe<string | number>
  chatSessionId: Maybe<string | number>
}

export const enum States {
  'USER' = 'user',
  'APP' = 'app'
}

export interface State {
  [States.USER]: UserState,
  [States.APP]: AppState
}

