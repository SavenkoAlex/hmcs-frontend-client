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
import { gql } from 'graphql-tag'

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

      // fileStApi.saveFile(formData)
      console.log('rest execution')
      this.$apolloProvider.clients.restClient.query({
        query: gql`query upload ($file: File!)   {
          post (body: $file)
          @rest (
            type: "File"
            path: "/api/file/store"
            method: "POST"
            bodySerializer: "fileEncode"
            bodyKey: "body"
            ) {
              res
          }
        }
        `,
        variables: {
          file: formData
        }
      })
    }
  }
})
</script>
