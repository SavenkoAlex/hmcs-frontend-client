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
import '@/components/CameraController/CameraController.scss'

/** types */
import { 
  Data,
 } from '@/components/CameraController/types'
 import { 
  ValidationError,
  MediaDevice
 } from '@/types/global'

/** components */
import IconButton from '@/components/general/Buttons/IconButton/IconButton'
import CameraIcon from '@/assets/images/camera_32.svg'
import Modal from '@/components/general/Modal/Modal'
import Label from '@/components/general/Label/Label'
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import Checkbox from '@/components/general/inputs/Checkbox/Checkbox'
import { SidePosition } from '@/types/global'

/** constants */
import { VideoInputKind, MaxCameras } from '@/types/global'

export default defineComponent({

  name: 'CameraController',

  watch: {
    devices: {
      handler: function (newValue: MediaDevice[]) {
        this.validateMediaDevicesSelection(newValue)
      },
      deep: true,
    }
  },

  computed: {
    ...mapGetters('app', ['cameras']),
  },

  data (): Data {
    return {
      devices: [],
      isModalVisible: false,
      devicesValidationError: null
    }
  },

  methods: {
    ...mapActions('app', ['setCamera']),

    /**
     * validates media devices selection
     * @param devices 
     * @returns 
     */
    validateMediaDevicesSelection (devices: MediaDevice[]): void {
      let counter = 0
      for (const item of devices) {
        if (item.selected) {
          counter += 1
        }
      }

      if (counter > MaxCameras) {
        this.devicesValidationError = ValidationError.CAMERAS_NUMBER_REACHED
        return
      }

      if (counter === 0) {
        this.devicesValidationError = ValidationError.CAMERAS_NUMBER_EMPTY
        return
      }

      this.devicesValidationError = false
    },

    /** obtains devices list */
    async getDevices (): Promise <MediaDevice[] | null> {
      if (!navigator.mediaDevices.enumerateDevices) {
        return null
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        return devices.filter(item => item.kind === VideoInputKind).map(item => ({
          label: item.label,
          deviceId: item.deviceId,
          kind: item.kind,
          selected: this.cameras[item.deviceId]?.selected || false
        }))

      } catch (err) {
        console.error(err)
        return []
      }
    },

    /** opens modal with available cameras */
    async showCameraModal (): Promise <void> {
      try {
        const devices = await this.getDevices()

        if (!devices) {
          return
        }

        this.devices = devices
        this.isModalVisible = true
      } catch (err) {
        console.error(err)
        this.devices = []
      }
    },

    applySelectedCameras (): void {
      this.isModalVisible = false
      this.devices.forEach(item => {
        this.setCamera(item)
      })
    }
  },


  render (): VNode {
    return <div class='camera-controller'>
      <Modal
        isVisible={this.isModalVisible}
        onClose={() => this.isModalVisible = false}
      >
        {{
          header: () => <Label text={this.$t('components.cameraController.selectCamera')}/>,
          default: () => this.devices?.length
            ? <ul class='camera-controller__devices'>
              {
                this.devices.map(item => <li>
                  <Checkbox
                    label={{text: item.label}}
                    labelPosition={SidePosition.RIGHT}
                    modelValue={item.selected}
                    onUpdate:modelValue={(event) => item.selected = event}
                  />
                </li>)
              }
            </ul>
            : <div class='camera-controller__no-devices'> <Label text={this.$t('components.cameraController.camerasNotFound')}/> </div>,
              
          footer: () => [<TextButton 
              text={this.$t('common.apply')}
              disabled={!!this.devicesValidationError}
              onClick={() => this.applySelectedCameras()}
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
