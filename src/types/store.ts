import { Maybe, MediaDevice, VideoErrorState, ConnectionState, MediaState, SlowLink } from '@/types/global'
import { AttachEvent, TextRoomPluginError } from '@/types/janus'
export const isAuthentificated = import.meta.env.VITE_IS_AUTHENTIFICATED || 'isa'
export const userData = import.meta.env.VITE_USER_DATA || 'usa'
export const amount = import.meta.env.VITE_AMOUNT || 'ama'
export const webrtcSessionId = import.meta.env.VITE_WEBRTC_SESSION_ID || 'vs'
export const chatSessionId =  import.meta.env.VITE_CHAT_SESSION_ID || 'sch'

export interface UserState {
  accessToken: Maybe<string>,
  amount: number,
  isAuthentificated: boolean,
  userData: string | null
}

export const enum WebRTCVideoMountPointState {
  STREAM_JOINED = 'streamJoined',
  STREAM_CONFIGURED = 'streamConfigured',
  STREAM_PUBLISHED = 'streamPublished'
}

export interface AppState {
  webrtcSessionId: Maybe<string | number>
  chatSessionId: Maybe<string | number>,
  devices: Record<string, MediaDevice>
  performanceNavigationType: NavigationTimingType | null,
  videoErrorState: VideoErrorState | null,
  chatErrorState: TextRoomPluginError | null
  isChatHandlerAvailable: boolean
  isVideoHandlerAvailable: boolean
  [AttachEvent.SUCCESS]: boolean
  [AttachEvent.ERROR]: boolean
  [AttachEvent.CONSENTDIALOG]: boolean
  [AttachEvent.WEBRTCSTATE]: ConnectionState | null
  [AttachEvent.CONNECTIONSTATE]: ConnectionState | null
  [AttachEvent.ICESTATE]: ConnectionState | null
  [AttachEvent.MEDIASTATE]: MediaState | null
  [AttachEvent.SLOWLINK]: SlowLink | null
  [WebRTCVideoMountPointState.STREAM_CONFIGURED]: boolean
  [WebRTCVideoMountPointState.STREAM_JOINED]: boolean
  [WebRTCVideoMountPointState.STREAM_PUBLISHED]: boolean
}

export const enum States {
  'USER' = 'user',
  'APP' = 'app'
}

export interface State {
  [States.USER]: UserState,
  [States.APP]: AppState
}

