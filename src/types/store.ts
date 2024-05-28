import { User, Maybe, MediaDevice } from '@/types/global'


export interface UserState extends User {
  accessToken: Maybe<string>,
  amount: number
}

export interface AppState {
  cameras: Record<string, MediaDevice>,
}

export const enum States {
  'USER' = 'user',
  'APP' = 'app'
}

export interface State {
  [States.USER]: UserState,
  [States.APP]: AppState
}
