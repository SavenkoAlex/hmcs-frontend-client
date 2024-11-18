import { VideoErrorHanlerEvent } from '@/types/global'
import { VIDEO_ROOM_PLUGIN_EVENT, VideoRoomPluginError } from '@/types/janus'
export interface ErrorManager {

  getAction: (errorCode: number, retry: number) => VideoErrorHanlerEvent
}
