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

/** Join response data */
export type JoinResult = {
  videoroom: 'joined',
  room: string,
  description: string,
  id: string,
  private_id: string,
  publishers: Publisher[],
}

/** Stream ppublisher data */
export type Publisher = {
  id: string,
  display: string,
  dummy: boolean,
  streams: unknown[]
}

export const enum UserRole {
  USER = 'user',
  WORKER = 'worker',
  ANONYMOUS = 'anonymous'
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
  LARGE = 'large',
  MEDIUM = 'medium',
  SMALL = 'small'
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
  username?: Maybe <string>,
  role?: Maybe<string>,
  type?: Maybe<UserRole>,
  id?: Maybe<string>
  streamId: Maybe<number>,
  avatar?: string
}

export type UserAccount = {
  amount: number
}


export const storeUserKeyMap: Record <keyof User, string> = {
  login: 'nl',
  username: 'eu',
  role: 'er',
  type: 'et',
  id: 'di',
  avatar: 'av',
  streamId: 'si'
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
