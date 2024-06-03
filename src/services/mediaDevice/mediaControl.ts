import { MediaDevice, VideoInputKind, AudioInputKind } from '@/types/global'

/**
 * +media control class
 */
export class MediaControl {

  /**
   * obtains media devices
   * @returns array of devices
   */
  static async getDevices (): Promise <MediaDevice[]> {
    if (!navigator.mediaDevices.enumerateDevices) {
        return []
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        return devices.map(item => ({
          label: item.label,
          deviceId: item.deviceId,
          kind: item.kind,
          selected: false,
          muted: true
        }))

      } catch (err) {
        console.error(err)
        return []
      }
  }

  static muteAudio (constrains: MediaStreamConstraints) {
    constrains.audio = false
  }
  /**
   * adds selected devices to constrains audio
   * @param constrains 
   * @param devices 
   */
  static unmuteAudio (constrains: MediaStreamConstraints, devices: MediaDevice[]) {
    constrains.audio = {
      advanced: devices.filter(item => item.kind === AudioInputKind).map(item => ({deviceId: item.deviceId}))
    }
  }
  /**
   * sets video constarins to false
   * @param constrains 
   * @param devices 
   */
  static muteVideo (constrains: MediaStreamConstraints, devices: MediaDevice[]) {
    constrains.video = false
  }


  /**
   * adds selected devices to constrains video
   * @param constrains 
   * @param devices 
   */
  static unmuteVideo (constrains: MediaStreamConstraints, devices: MediaDevice[]) {
    constrains.video = {
      advanced: devices.filter(item => item.kind === VideoInputKind).map(item => ({deviceId: item.deviceId}))
    }
  }
}
