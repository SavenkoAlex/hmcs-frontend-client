 <template>
  <div id="nav">
    <router-view></router-view>
    <va-app-bar>
      <router-link to="/">
        <va-button icon="home" color="#fff" flat :rounded="false" />
      </router-link>
      <va-spacer />
      <router-link to="/login">
        <va-button  color="#fff" flat :rounded="false">Login</va-button>
      </router-link>
    </va-app-bar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data () {
    return {
    }
  }
})
</script>

<style scoped>
  #nav { position: relative; }
</style>
