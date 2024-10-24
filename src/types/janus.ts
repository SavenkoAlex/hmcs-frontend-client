import { JanusJS } from 'janus-gateway'

/** video room plugin  message events */
export const enum VIDEO_ROOM_PLUGIN_EVENT  {
  PUB_JOINED = 'joined',
  SUB_JOINED = 'subscribed',
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
  SUCCESS = 'succes',
  ERROR = 'error',
  CONSENTDIALOG = 'consentDialog',
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


export const webRTCEventJanusMap = {
  [AttachEvent.SUCCESS]: 'connected',
  [AttachEvent.ERROR]: AttachEvent.ERROR,
  [AttachEvent.CONSENTDIALOG]: AttachEvent.CONSENTDIALOG,
  [AttachEvent.WEBRTCSTATE]: AttachEvent.WEBRTCSTATE,
  [AttachEvent.ICESTATE]: 'webrtcicestate',
  [AttachEvent.MEDIASTATE]: 'webrtcmediastate',
  [AttachEvent.SLOWLINK]: AttachEvent.SLOWLINK,
  [AttachEvent.ONMESSAGE]: 'pluginmessage',
  [AttachEvent.ONLOCALTRACK]: AttachEvent.ONLOCALTRACK,
  [AttachEvent.ONREMOTETRACK]: AttachEvent.ONREMOTETRACK,
  [AttachEvent.ONDATAOPEN]: AttachEvent.ONDATAOPEN,
  [AttachEvent.ONDATA]: AttachEvent.ONDATA,
  [AttachEvent.ONCLEANUP]: "closed",
  [AttachEvent.DETACHED]: AttachEvent.DETACHED
} as const
