import { User, Maybe, MediaDevice } from '@/types/global'

export const isAuthentificated: string = import.meta.env.IS_AUTHENTIFICATED as string || 'isa'
export const userData: string = import.meta.env.USER_DATA || 'usa'
export const amount: string = import.meta.env.AMOUNT || 'ama'

export interface UserState {
  accessToken: Maybe<string>,
  amount: number,
  isAuthentificated: boolean,
  userData: string | null
}

export interface AppState {
  devices: Record<string, MediaDevice>,
}

export const enum States {
  'USER' = 'user',
  'APP' = 'app'
}

export interface State {
  [States.USER]: UserState,
  [States.APP]: AppState
}

