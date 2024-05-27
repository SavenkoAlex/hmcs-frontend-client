
export type Device = {
  label: string,
  value: string,
  kind: MediaDeviceKind,
  selected: boolean
}

export type Data = {
  devices: Device[],
  constraints: { video: true, audio: false },
  isModalVisible: boolean
}
