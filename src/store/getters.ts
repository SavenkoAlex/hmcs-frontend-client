import { State } from './index'

export const mainGetters = {
  getTestOutput: (state: State): string => {
    return state.main.defaultStoreMessage
  },

  getMenuItems: (state: State): {path: string, label: string}[] => {
    return state.main.menuItems
  }
}

export const deviceGetters = {
  //
}
