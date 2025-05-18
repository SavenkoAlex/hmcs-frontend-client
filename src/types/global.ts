import Janus, { JanusJS } from 'janus-gateway'
import { InjectionKey } from 'vue'
import { VideoRoomPluginError } from '@/types/janus'
import { SubscriberStreamHandler } from '@/services/webrtc/webrtcSubscriber'
import { PublisherStreamHandler } from '@/services/webrtc/webrtcPublisher'
import emitter from '@/services/eventBus'

export type MaybeId = string | number | unknown

export type Room = {       
  room : number
  description? :  string
  'pin_required'? : string | boolean
  'is_private' : boolean
  'max_publishers' : number
  bitrate : string
  'bitrate_cap'? : boolean
  'fir_freq' : unknown
  'require_pvtid': boolean
  'require_e2ee': boolean
  'dummy_publisher': boolean
  'notify_joining': boolean
  audiocodec : string
  videocodec : string
  'opus_fec'?: boolean
  'opus_dtx'?: boolean
  record : boolean
  'rec_dir' : string
  'lock_record' : boolean
  'num_participants' : number
  'audiolevel_ext': boolean
  'audiolevel_event': boolean
  'audio_active_packets'? : unknown
  'audio_level_average'? : unknown
  'videoorient_ext': boolean
  'playoutdelay_ext': boolean
  'transport_wide_cc_ext': boolean
}

/** Stream data  for attached event*/
export type Stream = {
  mindex: MaybeId,
  mid: MaybeId,
  type: 'audio' | 'video' | 'data',
  active: boolean,
  feed_id: MaybeId,
  feed_mid: MaybeId,
  feed_display: Maybe <string>,
  send: boolean,
  codec: Maybe <string>,
  'h264-profile': unknown,
  'vp9-profile': unknown,
  ready: boolean,
  simulcast: unknown,
  svc: unknown,
  'playout-delay': unknown,
  sources: Maybe<number>
  source_ids: string[]
}

/** Join response data */
export type JoinResult = {
  videoroom: 'joined',
  room: string,
  description: string,
  id: string,
  private_id: string,
  publishers: Publisher[],
}

/** janus message signature */
export type JanusMessage = {
  room: number,
  description: string,
  pin_required: boolean,
  num_participants: number,
  history: number
}

/** Stream ppublisher data */
export type Publisher = {
  id: string,
  display: string,
  dummy: boolean,
  streams: unknown[]
}

export const enum UserRole {
  WORKER = 2,
  USER,
  ANONYMOUS
}

export const enum StreamRole {
  PUBLISHER = 'publisher',
  PUBLISHER_OFFLINE = 'publisherOffline',
  SUBSCRIBER = 'subscriber',
  OBSERVER = 'observer',
}

export type InputLabel = {
  scale?: ElementScale,
  text: string
}

export const enum SidePosition {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
  BUTTOM = 'buttom'
}

export const enum DisplayLocation {
  TOP = 'top',
  BOTTOM = 'bottom'
}

export const enum ElementScale {
  SMALLEST = 'smallest',
  SMALLER = 'smaller',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  LARGER = 'larger',
  LARGEST = 'largest'
}

export const enum ValidationError  {
  EMPTY_FIELD = 'emptyField',
  INVALID_FIELD = 'invalidField',
  CAMERAS_NUMBER_REACHED = 'camerasNumberReached',
  CAMERAS_NUMBER_EMPTY = 'camerasNumberEmpty',
  MICS_NUMBER_REACHED = 'micsNumberReached',
  MICS_NUMBER_EMPTY = 'micsNumberEmpty',
} 

export type InputError = null | false | ValidationError.EMPTY_FIELD

export type ErrorBucket = {
  [key: string]: InputError
}

export type Maybe <T extends string | number | Record <string, unknown>> = T | null | undefined

export type NotifierStatus = 'error' | 'warn' | 'success'

export const zIndex = 1650

export type User = {
  login: Maybe <string>,
  username: Maybe <string>,
  role: Maybe<number>,
  id: Maybe<string>
  streamId: Maybe<number>,
  avatar: Maybe<string>
}

export type RegisterUserData = Omit <User, 'id' | 'streamId' | 'avatar' > & { password: string }

export type UserAccount = {
  amount: number
}

export const storeUserKeyMap: Record <keyof User & keyof UserAccount, string> = {
  login: 'nl',
  username: 'eu',
  role: 'er',
  id: 'di',
  avatar: 'av',
  streamId: 'si',
  amount: 'ma'
}

/** session storage key */
export const enum SessionStorageKeys {
  // secret key to encrypt localstorage values
  KEY = 'cne',
  IV = 'vi'
}
/** enumerateDevices media devices kinds */
export type MediaDevicesKind = 'audioinput' | 'videoinput' 
export const AudioInputKind: MediaDevicesKind = 'audioinput'
export const VideoInputKind: MediaDevicesKind = 'videoinput'
export const MaxCameras = 2
export const MaxMics = 1

/** Media device */
export type MediaDevice = {
  label: string,
  deviceId: string,
  kind: MediaDeviceKind,
  muted: boolean,
  selected: boolean
}

/** refactor needed (what is about some other plugin?) */
export type Handler = JanusJS.PluginHandle

/** webrtc plugin init function result */
export type InitResult <T extends Handler>= {
  emitter: ReturnType <typeof emitter>,
  handler: () => Promise<{janusHandler: T, janusInstance: Janus} | null>
} | null

/** janus plugins */
export const enum JanusPlugin {
  VITE_WEBRTC_PLUGIN = 'janus.plugin.videoroom',
  VITE_TEXT_PLUGIN = 'janus.plugin.textroom'
}

/** plugin handler parameters */
export interface HandlerDescription {
  // stream id of publisher used as room id
  roomId: number
  displayName: string,
}

export type WebRTCHandlerConstructor = {
  handler: () => Promise <{ janusHandler: JanusJS.PluginHandle, janusInstance: Janus }| null>, 
  emitter: ReturnType<typeof emitter>,
  options: HandlerDescription
}

/** plugin handlers */
export const subscriberHandlerKey = Symbol('subscriberHandler') as InjectionKey <string>
export const publisherHandlerKey = Symbol('publisherHandler') as InjectionKey <string>
export const chatKey = Symbol('chatHandler') as InjectionKey<string>

/** outputs type */
export type Output = 'log' | 'error' | 'warn'

/** 
 * default retry number 
 * count of same plugin error that can be handled some how
 */
export const errorRetryNumber = 3

/**
 * video server response error code with number of attempts to fix 
 */
export type VideoErrorState = {
  state: VideoRoomPluginError,
  retry: number
}

/** video handler */
export type VideoHandler <T extends UserRole> = T extends UserRole.WORKER
  ? PublisherStreamHandler
  : SubscriberStreamHandler

export type ConnectionState = 'connected' | 'failed' | 'disconnected' | 'closed'
export type MediaState = { medium: 'audio' | 'video', receiving: boolean, mid?: number }
export type SlowLink = { uplink: boolean, lost: number, mid: string }
export type RemoteTrack = { 
  track: MediaStreamTrack, 
  mid: string, 
  on: boolean,
  metadata?: unknown
}
export type LocalTrack = { 
  track: MediaStreamTrack, 
  on: boolean
}

export type JanusMessageEvent = {
  msg: JanusJS.Message,
  jsep?: JanusJS.JSEP
}
/** Prefix type need to avoid mixinf events */
export type Prefix <T extends string, K extends string> = `${T}-${K}`

export type HandlerType = 'pub' | 'sub' 
