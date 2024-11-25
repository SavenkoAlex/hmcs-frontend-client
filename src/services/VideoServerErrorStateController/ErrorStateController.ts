import { VideoErrorState, errorRetryNumber } from '@/types/global'
import { VideoRoomPluginError } from '@/types/janus'
import { I18n, I18nD } from 'vue-i18n'

export const enum ErrorAction {
  'CONNECT' = 'connect',
  'RECONNECT' = 'reconnect',
  'REINIT' = 'init',
  'LEAVE' = 'leave',
  'PASSTOUSER' = 'passToUser',
  'RELOGIN' = 'relogin'
}

export interface ErrorController {
  getState: (currentErrorState: VideoErrorState | null, serverError: VideoRoomPluginError) => VideoErrorState | null
  getAction: (errorState: VideoErrorState) => ErrorAction | null
}

export class ErrorStateController implements ErrorController {
  getAction (currentErrorState: VideoErrorState) {
    if (!currentErrorState) {
      return null
    }

    if (currentErrorState.retry >= import.meta.env.RETRY_NUMBER || errorRetryNumber) {
      return  ErrorAction.REINIT
    }

    switch (currentErrorState.state) {
      default:
        return ErrorAction.REINIT
    }
  }

  getState (currentErrorState: VideoErrorState | null, serverError: VideoRoomPluginError) {
    if (!currentErrorState) {
      return {
        state: serverError,
        retry: 1
      }
    }

    if (currentErrorState.state != serverError) {
      return {
        state: serverError,
        retry: 1
      }
    }

    return {
      state: serverError,
      retry: currentErrorState.retry + 1
    }
  }
}
