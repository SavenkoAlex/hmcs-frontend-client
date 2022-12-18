<template>
<h1> File Upload </h1>
  <input type="file" ref='file'>
  <button @click='sendFile'> sendFile </button>
</template>

<script lang="ts">
import {
  defineComponent,
  ref
} from 'vue'
import fileStApi from '../api/fileStorage'
export default defineComponent({

  setup () {
    const file = ref('file')
    return {
      file
    }
  },

  computed: {
    pureFile () {
      const files = (this.$refs.file as HTMLInputElement).files
      return files ? files[0] : null
    }
  },

  methods: {
    sendFile () {
      if (!this.pureFile) {
        return
      }
      const formData = new FormData()
      formData.append('file', this.pureFile, this.pureFile.name)

      fileStApi.saveFile(formData)
    }
  }
})
</script>
