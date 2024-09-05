import {
  defineComponent,
  VNode,
  PropType,
} from 'vue'

/** store */
import { 
  mapActions,
  mapGetters
} from 'vuex'

/** styles */
import '@/components/DeviceController/DeviceController.scss'

/** types */
import { 
  Data,
  DeviceList,

 } from '@/components/DeviceController/types'

 import { 
  ValidationError,
  MediaDevice,
  AudioInputKind
 } from '@/types/global'

/** components */
import IconButton from '@/components/general/Buttons/IconButton/IconButton'
import CameraIcon from '@/assets/images/gears_32.svg'
import Modal from '@/components/general/Modal/Modal'
import Label from '@/components/general/Label/Label'
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import Checkbox from '@/components/general/inputs/Checkbox/Checkbox'
import { SidePosition } from '@/types/global'

/** constants */
import { VideoInputKind, MaxCameras, MaxMics } from '@/types/global'

/** helpers */
import { MediaControl } from '@/services/mediaDevice/mediaControl'

export default defineComponent({

  name: 'CameraController',

  emits: ['applydevices'],

  computed: {
    ...mapGetters('app', ['devices']),
  },

  data (): Data {
    return {
      isModalVisible: false,
      devicesValidationError: null,
      cameras: [],
      mics: []
    }
  },

  methods: {
    ...mapActions('app', ['setDevice']),

    /**
     * validates media devices selection
     * @param devices 
     * @returns 
     */
    validateMediaDevicesSelection (): void {
      let videoDevicesCounter = 0
      let audioDevicesCounter = 0

      for (const item of this.cameras) {
        if (item.selected) {
          videoDevicesCounter += 1
        }
      }

      if (videoDevicesCounter > MaxCameras) {
        this.devicesValidationError = ValidationError.CAMERAS_NUMBER_REACHED
        return
      }

      if (videoDevicesCounter === 0) {
        this.devicesValidationError = ValidationError.CAMERAS_NUMBER_EMPTY
        return
      }

      for (const item of this.mics) {
        if (item.selected) {
          audioDevicesCounter += 1
        }
      }

      if (audioDevicesCounter > MaxMics) {
        this.devicesValidationError = ValidationError.MICS_NUMBER_REACHED
        return
      }

      if (audioDevicesCounter === 0) {
        this.devicesValidationError = ValidationError.MICS_NUMBER_EMPTY
        return
      }

      this.devicesValidationError = false

    },

    /** obtains devices list */
    async getDevices (): Promise <void> {

      try {
        const devices = await MediaControl.getDevices()

        if (devices.length === 0) {
          return
        }
        
        devices.forEach((item) => {
          this.setDevice({
            ...item,
            selected: this.devices?.[item.deviceId]?.selected || false,
            muted: this.devices?.[item.deviceId]?.muted || true,
          })
        })

        const deviceArray: MediaDevice[] = Object.values(this.devices)
        this.cameras = deviceArray.filter((item: MediaDevice) => item.kind === VideoInputKind)
        this.mics = deviceArray.filter((item: MediaDevice) => item.kind === AudioInputKind)
      } catch (err) {
        console.error(err)
        return
      }
    },

    /** opens modal with available cameras */
    async showCameraModal (): Promise <void> {
      try {
        await this.getDevices()

        this.isModalVisible = true
      } catch (err) {
        console.error(err)
        this.devices = null
      }
    },

    applySelectedCameras (): void {
      this.isModalVisible = false
      if (!this.devices) {
        return
      }

      [...this.cameras, ...this.mics].forEach(item => {
        this.setDevice(item)
      })
    },

    onChecked (item: MediaDevice, event: unknown): void {
      item.selected = !!event
      this.validateMediaDevicesSelection()
    },
    onDevicesAplly (): void {
      this.applySelectedCameras()
      this.$emit('applydevices')
    }
  },


  render (): VNode {
    return <div class='device-controller'>
      <Modal
        isVisible={this.isModalVisible}
        onClose={() => this.isModalVisible = false}
      > 
        {{
          header: () => <Label text={this.$t('components.deviceController.selectDevices')}/>,
          default: () => this.cameras || this.devices
            ? <div class='device-controller__devices'>
                <Label text={this.$t('components.deviceController.cameras')}/>
                <ul class='device-controller__cameras'>
                  {
                    this.cameras && this.cameras.map((item: MediaDevice) => <li>
                      <Checkbox
                        label={{text: item.label}}
                        labelPosition={SidePosition.RIGHT}
                        modelValue={item.selected}
                        onUpdate:modelValue={(event) => this.onChecked(item, event)}
                      />
                    </li>)
                  }
              </ul>
              <Label text={this.$t('components.deviceController.mics')}/>
                <ul class='device-controller__mics'>
                  {
                    this.mics && this.mics.map((item: MediaDevice) => <li>
                      <Checkbox
                        label={{text: item.label}}
                        labelPosition={SidePosition.RIGHT}
                        modelValue={item.selected}
                        onUpdate:modelValue={(event) => this.onChecked(item, event)}
                      />
                    </li>)
                  }
              </ul>
              </div>
            : <div class='device-controller__no-devices'> <Label text={this.$t('components.deviceController.devicesNotFound')}/> </div>,
              
          footer: () => [<TextButton 
              text={this.$t('common.apply')}
              disabled={!!this.devicesValidationError || !this.devices}
              onClick={() => this.onDevicesAplly()}
            />, 
            <TextButton 
              text={this.$t('common.cancel')}
              onClick={() => this.isModalVisible = false}
            />
          ],
        }}
      </Modal>

      <IconButton
        onClick={() => this.showCameraModal()}
      >
        <CameraIcon/>
      </IconButton> 
    </div>
  }
})
