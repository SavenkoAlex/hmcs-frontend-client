import mitt from 'mitt'
import { 
  webRTCEvent,
  IceState,
} from '@/types/janus'

import { 
  MediaState,
  RemoteTrack,
  LocalTrack,
  SlowLink,
  JanusMessageEvent
} from '@/types/global'

interface Events extends Record <keyof typeof webRTCEvent, unknown>  {
  'janus-success': boolean,
  'janus-error': unknown,
  'janus-destroyed': void,
  'janus-consentDialog': boolean,
  'janus-connectionState': 'connected' | 'failed',
  'janus-webrtcState': boolean,
  'janus-iceState': IceState,
  'janus-mediaState': MediaState,
  'janus-slowLink': SlowLink,
  'janus-onmessage': JanusMessageEvent,
  'janus-onlocaltrack': LocalTrack,
  'janus-onremotetrack': RemoteTrack,
  'janus-ondataopen': string,
  'janus-ondata': string,
  'janus-oncleanup': void,
  'janus-ondetached': unknown,
  'video-joined': unknown,
  'video-subscribed': unknown,
  'video-attached': unknown,
  'video-publisher_list': unknown,
  'video-participants_list': unknown,
  'video-publisher_joined': unknown,
  'video-started': unknown,
  'video-paused': unknown,
  'video-switched': unknown,
  'video-configured': boolean,
  'video-slowlink': unknown,
  'video-display': unknown,
  'video-unpublished': unknown,
  'video-leaving': unknown,
  'video-updated': unknown,
  'video-kicked': unknown,
  'video-recording_enabled_state': unknown,
  'video-talking': unknown,
  'video-sc_substream_layer': unknown,
  'video-sc_temporal_layers': unknown,
  'video-allowed': unknown,
  'video-exists': unknown,
  'video-rooms_list': unknown,
  'video-created': unknown,
  'video-destroyed': unknown,
  'video-rtp_fwd_started': unknown,
  'video-rtp_fwd_stopped': unknown,
  'video-rtp_fwd_list': unknown,
  'text-edited': unknown,
  'text-destroyed': unknown,
  'text-kicked': unknown,
  'text-joined': void,
  'text-success': unknown,
  'text-datrecivied': unknown,
  'text-error': unknown,
  'user-destroy-webrtc-session': void
}

const emitter = mitt <{[key in keyof Events]: Events[key]}>()

export default emitter
