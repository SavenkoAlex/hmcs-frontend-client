import { User, Maybe } from '@/global/global'


export interface UserState extends User {
  accessToken: Maybe<string>,
  amount: number
}

export interface AppState {
  [key: string]: unknown
}

export const enum States {
  'USER' = 'user',
  'APP' = 'app'
}

export interface State {
  [States.USER]: UserState,
  [States.APP]: AppState
}
