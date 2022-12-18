import { MainState } from '@/store'

export const getters = {
  getTestOutput: (state: MainState): string => {
    return state.defaultStoreMessage
  }
}
