import { Prefix } from '@/types/global'

/** video room plugin  message events */
export const enum VIDEO_ROOM_PLUGIN_EVENT  {
  PUB_JOINED = 'joined',
  SUB_JOINED = 'subscribed',
  ATTACHED = 'attached',
  PUB_LIST = 'publisher_list',
  PARTICIPANTS_LIST = 'participants_list',
  PUB_PEER_JOINED = 'publisher_joined',
  STARTED = 'started',
  PAUSED = 'paused',
  SWITCHED = 'switched',
  CONFIGURED = 'configured',
  SLOW_LINK = 'slowlink',
  DISPLAY = 'display',
  UNPUBLISHED = 'unpublished',
  LEAVING = 'leaving',
  UPDATED = 'updated',
  KICKED = 'kicked',
  RECORDING_ENABLED_STATE = 'recording_enabled_state',
  TALKING = 'talking',
  SC_SUBSTREAM_LAYER = 'sc_substream_layer',
  SC_TEMPORAL_LAYERS = 'sc_temporal_layers',
  ALLOWED = 'allowed',
  EXISTS = 'exists',
  ROOMS_LIST = 'list',
  CREATED = 'created',
  DESTROYED = 'destroyed',
  RTP_FWD_STARTED = 'rtp_fwd_started',
  RTP_FWD_STOPPED = 'rtp_fwd_stopped',
  RTP_FWD_LIST = 'rtp_fwd_list',
}

/** text room plugin events */
export const enum TEXT_ROOM_PLUGIN_EVENT {
  EDITED = 'edited',
  DESTROYED = 'destroyed',
  KICKED = 'kicked',
  JOINED = 'joined',
  SUCCESS = 'success',
  DATA = 'datarecivied'
}

/** janus attach events */
export type JanusAttchCb =
  // the handle was successfully created and is ready to be used;
  'succes' |          
  //the handle was NOT successfully created;
  'error' |         
  // this callback is triggered just before getUserMedia is called (parameter=true) and after 
  // it is completed (parameter=false); this means it can be used to modify the UI accordingly, 
  // e.g., to prompt the user about the need to accept the device access consent requests;  
  'consentDialog' |
  // this callback is triggered with a true value when the PeerConnection associated to a handle becomes active 
  // (so ICE, DTLS and everything else succeeded) from the Janus perspective, 
  // while false is triggered when the PeerConnection goes down instead; 
  //useful to figure out when WebRTC is actually up and running between you and Janus 
  // (e.g., to notify a user they're actually now active in a conference); 
  // notice that in case of false a reason string may be present as an optional parameter;
  'webrtcState' | 
  // this callback is triggered when the connection state for the PeerConnection associated to the handle changes: 
  // the argument of the callback is the new state as a string (e.g., "connected" or "failed");
  'connectionState' |
  // this callback is triggered when the ICE state for the PeerConnection associated to the handle changes: 
  // the argument of the callback is the new state as a string (e.g., "connected" or "failed");
  'iceState' |
  // this callback is triggered when Janus starts or stops receiving your media: for instance, 
  // a mediaState with mid=0, type=audio and on=true means Janus started receiving the audio stream 
  // identified by mid b in the offer/answer exchange and transceivers (or started getting them again after 
  // a pause of more than a second); a mediaState with type=video and on=false means Janus hasn't received any video 
  // from you in the last second, after a start was detected before; useful to figure out when Janus 
  // actually started handling your media, or to detect problems on the media path (e.g., media never started, or stopped at some time);
  'mediaState' | 
  // this callback is triggered when Janus reports trouble either sending or receiving media on the specified PeerConnection, 
  // typically as a consequence of too lost packets detected to/from the user in the last second: 
  // for instance, a slowLink with uplink=true means you notified several missing packets from Janus, 
  // while uplink=false means Janus is not receiving all your packets; useful to figure out when there 
  // are problems on the media path (e.g., excessive loss), in order to possibly react accordingly 
  // (e.g., decrease the bitrate if most of our packets are getting lost);
  'slowLink' | 
  // a message/event has been received from the plugin;
  'onmessage' | 
  // a local MediaStreamTrack is available and ready to be displayed;
  'onlocaltrack' |
  // a remote MediaStreamTrack is available and ready to be displayed;
  'onremotetrack' | 
  // a Data Channel is available and ready to be used;
  'ondataopen' | 
  // data has been received through the Data Channel;
  'ondata' |
  // the WebRTC PeerConnection with the plugin was closed;
  'oncleanup' | 
  // the plugin handle has been detached by the plugin itself, and so should not be used anymore.
  'detached' 

export const enum AttachEvent {
  SUCCESS = 'success',
  ERROR = 'error',
  DESTROYED = 'destroyed',
  CONSENTDIALOG = 'consentDialog',
  CONNECTIONSTATE = 'connectionState',
  WEBRTCSTATE = 'webrtcState',
  ICESTATE = 'iceState',
  MEDIASTATE = 'mediaState',
  SLOWLINK = 'slowLink',
  ONMESSAGE = 'onmessage',
  ONLOCALTRACK = 'onlocaltrack',
  ONREMOTETRACK = 'onremotetrack',
  ONDATAOPEN = 'ondataopen',
  ONDATA = 'ondata',
  ONCLEANUP = 'oncleanup',
  DETACHED = 'detached'
}

export const enum TextRoomPluginError {
  JANUS_TEXTROOM_ERROR_NO_MESSAGE	= 411,
  JANUS_TEXTROOM_ERROR_INVALID_JSON,
  JANUS_TEXTROOM_ERROR_MISSING_ELEMENT,
  JANUS_TEXTROOM_ERROR_INVALID_ELEMENT,
  JANUS_TEXTROOM_ERROR_INVALID_REQUEST,
  JANUS_TEXTROOM_ERROR_ALREADY_SETUP,
  JANUS_TEXTROOM_ERROR_NO_SUCH_ROOM,
  JANUS_TEXTROOM_ERROR_ROOM_EXISTS,
  JANUS_TEXTROOM_ERROR_UNAUTHORIZED,
  JANUS_TEXTROOM_ERROR_USERNAME_EXISTS,
  JANUS_TEXTROOM_ERROR_ALREADY_IN_ROOM,
  JANUS_TEXTROOM_ERROR_NOT_IN_ROOM,
  JANUS_TEXTROOM_ERROR_NO_SUCH_USER,
  JANUS_TEXTROOM_ERROR_UNKNOWN_ERROR =	499
}

export const enum VideoRoomPluginError {
  /*
  INVALID_REQUEST_ON_UNCONFIGURED_PARTICIPANT,
  // create a new handle
  JANUS_VIDEOROOM_ERROR_NOT_IN_A_ROOM = 425,
  ROOM_ALREADY_EXISTS = 427,
  JANUS_VIDEOROOM_ERROR_NO_SUCH_FEED = 428,
  JANUS_VIDEOROOM_ERROR_MISSING_ELEMENT,
  JANUS_VIDEOROOM_ERROR_INVALID_ELEMENT,
  JANUS_VIDEOROOM_ERROR_INVALID_SDP_TYPE,
  JANUS_VIDEOROOM_ERROR_PUBLISHERS_FULL,
  JANUS_VIDEOROOM_ERROR_UNAUTHORIZED,
  JANUS_VIDEOROOM_ERROR_ALREADY_PUBLISHED,
  JANUS_VIDEOROOM_ERROR_NOT_PUBLISHED,
  JANUS_VIDEOROOM_ERROR_ID_EXISTS,
  JANUS_VIDEOROOM_ERROR_INVALID_SDP,
  JANUS_VIDEOROOM_ERROR_UNKNOWN = 999,
  JANUS_VIDEOROOM_ERROR_ROOM_ALEAВY_CREATED,
  JANUS_VIDEOROOM_ERROR_NO_MEDIA
  */
  JANUS_VIDEOROOM_ERROR_UNKNOWN_ERROR	= 499,
  JANUS_VIDEOROOM_ERROR_NO_MESSAGE = 421,
  JANUS_VIDEOROOM_ERROR_INVALID_JSON = 422,
  JANUS_VIDEOROOM_ERROR_INVALID_REQUEST	= 423,
  JANUS_VIDEOROOM_ERROR_JOIN_FIRST = 424,
  JANUS_VIDEOROOM_ERROR_ALREADY_JOINED = 425,
  JANUS_VIDEOROOM_ERROR_NO_SUCH_ROOM = 426,
  JANUS_VIDEOROOM_ERROR_ROOM_EXISTS	= 427,
  JANUS_VIDEOROOM_ERROR_NO_SUCH_FEED = 428,
  JANUS_VIDEOROOM_ERROR_MISSING_ELEMENT = 429,
  JANUS_VIDEOROOM_ERROR_INVALID_ELEMENT	= 430,
  JANUS_VIDEOROOM_ERROR_INVALID_SDP_TYPE = 431,
  JANUS_VIDEOROOM_ERROR_PUBLISHERS_FULL	= 432,
  JANUS_VIDEOROOM_ERROR_UNAUTHORIZED	= 433,
  JANUS_VIDEOROOM_ERROR_ALREADY_PUBLISHED = 434,
  JANUS_VIDEOROOM_ERROR_NOT_PUBLISHED	= 435,
  JANUS_VIDEOROOM_ERROR_ID_EXISTS	= 436,
  JANUS_VIDEOROOM_ERROR_INVALID_SDP	= 437,
  JANUS_VIDEOROOM_ERROR_INVALID_FEED = 438,
}

export const enum CommonVideoPluginError {
  SERVER_DOWN = 200
}

// plugin events used in handler initialization
export const webRTCEventJanusMap = {
  [AttachEvent.SUCCESS]: 'connected',
  [AttachEvent.ERROR]: AttachEvent.ERROR,
  [AttachEvent.CONSENTDIALOG]: AttachEvent.CONSENTDIALOG,
  [AttachEvent.WEBRTCSTATE]: 'webrtstate',
  [AttachEvent.ICESTATE]: 'webrtcicestate',
  [AttachEvent.MEDIASTATE]: 'webrtcmediastate',
  [AttachEvent.SLOWLINK]: AttachEvent.SLOWLINK,
  [AttachEvent.ONMESSAGE]: 'pluginmessage',
  [AttachEvent.ONLOCALTRACK]: AttachEvent.ONLOCALTRACK,
  [AttachEvent.ONREMOTETRACK]: AttachEvent.ONREMOTETRACK,
  [AttachEvent.ONDATAOPEN]: AttachEvent.ONDATAOPEN,
  [AttachEvent.ONDATA]: AttachEvent.ONDATA,
  [AttachEvent.ONCLEANUP]: "closed",
  [AttachEvent.DETACHED]: AttachEvent.DETACHED,
  [VIDEO_ROOM_PLUGIN_EVENT.CONFIGURED]: VIDEO_ROOM_PLUGIN_EVENT.CONFIGURED,
  'onConnectionState': 'onConnectionState',
  'destroyed': 'destroyed'
} as const

type webRTCEvent = Prefix <'janus', AttachEvent> | 
  Prefix<'video', VIDEO_ROOM_PLUGIN_EVENT> |
  Prefix<'text', TEXT_ROOM_PLUGIN_EVENT>

type JanusEvent = AttachEvent | VIDEO_ROOM_PLUGIN_EVENT | TEXT_ROOM_PLUGIN_EVENT

export const webRTCEvent: Record <webRTCEvent, JanusEvent> = {
  'janus-destroyed': AttachEvent.DESTROYED,
  'janus-success': AttachEvent.SUCCESS,
  'janus-error': AttachEvent.ERROR,
  'janus-consentDialog': AttachEvent.CONSENTDIALOG,
  'janus-connectionState': AttachEvent.CONNECTIONSTATE,
  'janus-webrtcState': AttachEvent.WEBRTCSTATE,
  'janus-iceState': AttachEvent.ICESTATE,
  'janus-mediaState': AttachEvent.MEDIASTATE,
  'janus-slowLink': AttachEvent.SLOWLINK,
  'janus-onmessage': AttachEvent.ONMESSAGE,
  'janus-onlocaltrack': AttachEvent.ONLOCALTRACK,
  'janus-onremotetrack': AttachEvent.ONREMOTETRACK,
  'janus-ondataopen': AttachEvent.ONDATAOPEN,
  'janus-ondata': AttachEvent.ONDATA,
  'janus-oncleanup': AttachEvent.ONCLEANUP,
  'janus-detached': AttachEvent.DETACHED,
  'video-joined': VIDEO_ROOM_PLUGIN_EVENT.PUB_JOINED,
  'video-subscribed': VIDEO_ROOM_PLUGIN_EVENT.SUB_JOINED,
  'video-attached': VIDEO_ROOM_PLUGIN_EVENT.ATTACHED,
  'video-publisher_list': VIDEO_ROOM_PLUGIN_EVENT.PUB_LIST,
  'video-participants_list': VIDEO_ROOM_PLUGIN_EVENT.PARTICIPANTS_LIST,
  'video-publisher_joined': VIDEO_ROOM_PLUGIN_EVENT.PUB_PEER_JOINED,
  'video-started': VIDEO_ROOM_PLUGIN_EVENT.STARTED,
  'video-paused': VIDEO_ROOM_PLUGIN_EVENT.PAUSED,
  'video-switched': VIDEO_ROOM_PLUGIN_EVENT.SWITCHED,
  'video-configured': VIDEO_ROOM_PLUGIN_EVENT.CONFIGURED,
  'video-slowlink': VIDEO_ROOM_PLUGIN_EVENT.SLOW_LINK,
  'video-display': VIDEO_ROOM_PLUGIN_EVENT.DISPLAY,
  'video-unpublished': VIDEO_ROOM_PLUGIN_EVENT.UNPUBLISHED,
  'video-leaving': VIDEO_ROOM_PLUGIN_EVENT.LEAVING,
  'video-updated': VIDEO_ROOM_PLUGIN_EVENT.UPDATED,
  'video-kicked': VIDEO_ROOM_PLUGIN_EVENT.KICKED,
  'video-recording_enabled_state': VIDEO_ROOM_PLUGIN_EVENT.RECORDING_ENABLED_STATE,
  'video-talking': VIDEO_ROOM_PLUGIN_EVENT.TALKING,
  'video-sc_substream_layer': VIDEO_ROOM_PLUGIN_EVENT.SC_SUBSTREAM_LAYER,
  'video-sc_temporal_layers': VIDEO_ROOM_PLUGIN_EVENT.SC_TEMPORAL_LAYERS,
  'video-allowed': VIDEO_ROOM_PLUGIN_EVENT.ALLOWED,
  'video-exists': VIDEO_ROOM_PLUGIN_EVENT.EXISTS,
  'video-list': VIDEO_ROOM_PLUGIN_EVENT.ROOMS_LIST,
  'video-created': VIDEO_ROOM_PLUGIN_EVENT.CREATED,
  'video-destroyed': VIDEO_ROOM_PLUGIN_EVENT.DESTROYED,
  'video-rtp_fwd_started': VIDEO_ROOM_PLUGIN_EVENT.RTP_FWD_STARTED,
  'video-rtp_fwd_stopped': VIDEO_ROOM_PLUGIN_EVENT.RTP_FWD_STOPPED,
  'video-rtp_fwd_list': VIDEO_ROOM_PLUGIN_EVENT.RTP_FWD_LIST,
  'text-edited': TEXT_ROOM_PLUGIN_EVENT.EDITED,
  'text-destroyed': TEXT_ROOM_PLUGIN_EVENT.DESTROYED,
  'text-kicked': TEXT_ROOM_PLUGIN_EVENT.KICKED,
  'text-joined': TEXT_ROOM_PLUGIN_EVENT.JOINED,
  'text-success': TEXT_ROOM_PLUGIN_EVENT.SUCCESS,
  'text-datarecivied': TEXT_ROOM_PLUGIN_EVENT.DATA
}

export type ErrorMessage = {
  error_code: number,
  error: string
}

export type CustomJanusApiResponse <T extends any>= {
  success: boolean,
  errorCode?: number | VideoRoomPluginError
  data?: T
}

// icestate event value
export type IceState = 'connected' | 'disconnected' | 'failed' | 'checking' | 'closed'

// connectionstate event value
export type ConnectionState = 'connected' | 'disconnected' | 'failed' | 'connecting'


