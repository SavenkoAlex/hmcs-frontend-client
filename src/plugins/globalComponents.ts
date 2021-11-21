import Badge from '../components/Badge.vue'
import BaseAlert from '../components/BaseAlert.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseCheckbox from '../components/BaseCheckbox.vue'
import BaseInput from '../components/BaseInput.vue'
import BasePagination from '../components/BasePagination.vue'
import BaseProgress from '../components/BaseProgress.vue'
import BaseRadio from '../components/BaseRadio.vue'
import BaseSlider from '../components/BaseSlider.vue'
import BaseSwitch from '../components/BaseSwitch.vue'
import Card from '../components/Card.vue'
import Icon from '../components/Icon.vue'
import vue from 'vue'

export default {
  install (app: vue.App): void {
    app.component(Badge.name, Badge)
    app.component(BaseAlert.name, BaseAlert)
    app.component(BaseButton.name, BaseButton)
    app.component(BaseInput.name, BaseInput)
    app.component(BaseCheckbox.name, BaseCheckbox)
    app.component(BasePagination.name, BasePagination)
    app.component(BaseProgress.name, BaseProgress)
    app.component(BaseRadio.name, BaseRadio)
    app.component(BaseSlider.name, BaseSlider)
    app.component(BaseSwitch.name, BaseSwitch)
    app.component(Card.name, Card)
    app.component(Icon.name, Icon)
  }
}
