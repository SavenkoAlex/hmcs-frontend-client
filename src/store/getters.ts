import { State } from './index'

export const getters = {
  getTestOutput: (state: State): string => {
    return state.defaultStoreMessage
  }
}
