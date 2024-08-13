import { User, Maybe, MediaDevice } from '@/types/global'


export interface UserState extends Omit <User, 'avatar'> {
  accessToken: Maybe<string>,
  amount: number,
  isAuthentificated: boolean
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
