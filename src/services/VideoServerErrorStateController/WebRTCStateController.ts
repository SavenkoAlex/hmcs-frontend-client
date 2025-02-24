import { ConnectionState, VideoErrorState, MediaState, SlowLink  } from '@/types/global'
import { AttachEvent, VideoRoomPluginError, VIDEO_ROOM_PLUGIN_EVENT, TextRoomPluginError } from '@/types/janus'
import { store } from '@/store'
import { actions } from '@/store/app/actions'

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

/*
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
  */

export interface IWebRTCStateController {
  setPluginState: <T extends Boolean | null | ConnectionState>(event: AttachEvent, payload: T)  => void
}

export class WebRTCStateController implements IWebRTCStateController {

  private appStore
  
  constructor () {
    this.appStore = store
  }

  setPluginState <T extends Boolean | null | ConnectionState | MediaState | SlowLink>(event: AttachEvent, payload: T) {
    const action = 'app/setWebrtcPlugin' + event.charAt(0).toUpperCase() + String(event).slice(1);
    this.appStore.dispatch(`${action}`, payload, { root: true })
  }

  setVideoMauntPointState (event: VIDEO_ROOM_PLUGIN_EVENT, payload: boolean) {
    const action = 'app/setStream' + event.charAt(0).toUpperCase() + String(event).slice(1);
    this.appStore.dispatch(`${action}`, payload, { root: true })
  }

  setChatErrorState (error: TextRoomPluginError) {
    const action = 'app/setChatError'
    this.appStore.dispatch(action, error, { root: true })
  }
}
