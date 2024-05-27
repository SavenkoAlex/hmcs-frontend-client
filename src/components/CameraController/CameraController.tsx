import {
  defineComponent,
  VNode,
  PropType
} from 'vue'

/** styles */
import '@/components/CameraController/CameraController.scss'

/** types */
import { 
  Data,
  Device
 } from '@/components/CameraController/types'

/** components */
import IconButton from '@/components/general/Buttons/IconButton/IconButton'
import CameraIcon from '@/assets/images/camera_32.svg'
import Modal from '@/components/general/Modal/Modal'
import Label from '@/components/general/Label/Label'
import TextButton from '@/components/general/Buttons/TextButton/TextButton'
import Checkbox from '@/components/general/inputs/Checkbox/Checkbox'
import { SidePosition } from '@/global/global'

export default defineComponent({

  name: 'CameraController',


  data (): Data {
    return {
      devices: [],
      isModalVisible: false,
      constraints: {
        video: true,
        audio: false
      }
    }
  },

  methods: {

    /** obtains devices list */
    async getDevices (): Promise <Device[] | null> {
      if (!navigator.mediaDevices.enumerateDevices) {
        return null
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        return devices.map(item => ({
          label: item.label,
          value: item.deviceId,
          kind: item.kind,
          selected: false
        }))

      } catch (err) {
        console.error(err)
        return null
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
      }
    }
  },


  render (): VNode {
    return <div class='camera-controller'>
      <Modal
        isVisible={this.isModalVisible}
        onClose={() => this.isModalVisible = false}
      >
        {{
          header: () => <Label text='Выберете камеру'/>,
          default: () => <ul class={'camera-controller__list'}>
            {
              this.devices.map(item => <li>
                <Checkbox
                  label={{text: item.label}}
                  labelPosition={SidePosition.RIGHT}
                  modelValue={item.selected}
                />
              </li>)
            }
          </ul>,
              
          footer: () => [<TextButton 
              text='Продолжить'
              disabled={!this.devices.find(item => item.selected === true)}
            />, 
            <TextButton text='Отмена'
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
