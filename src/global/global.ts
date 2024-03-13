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


export const enum UserRole {
  USER = 'user',
  WORKER = 'worker'
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
  EMPTY_FIELD = 'emtyField'
} 

export type InputError = null | false | ValidationError

export type ErrorBucket = {
  [key: string]: InputError
}

export type Maybe <T extends string | number | Record <string, unknown>> = T | null | undefined

export type NotifierStatus = 'error' | 'warn' | 'success'