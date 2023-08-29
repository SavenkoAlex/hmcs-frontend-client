<script lang="ts">
import { defineComponent, ref } from 'vue'
import streamApi, { StreamPublisher } from '../api/stream'

export default defineComponent({
  name: 'Stream',

  setup () {
    const title = 'Stream'
    const streams = ref<{publisher: string, stream: StreamPublisher}[]>()

    return {
      title,
      streams
    }
  },

  mounted () {
    streamApi.getStreams().then((res) => {
      if (!res) {
        return
      }
      this.streams = Object.entries(res.live).map((item) => {
        return {
          publisher: item[0],
          stream: item[1]
        }
      })
    })
  }
})
</script>

<template>
  <h1> {{ title }}  </h1>

  <div className="container mt-5">
    <h4>Live Streams</h4>
    <hr className="my-4"/>
    <div v-for='(item, index) in streams' :key='index' style="{max-width: 200px; max-height: 200px}">
      <h2>{{ item.publisher }}</h2>
      <router-link :to='String(`/live/${item.publisher}`)'>
          <va-button color="#fff" flat :rounded="false">
            <va-icon name="book" color="primary"/>
          </va-button>
        </router-link>
    </div>
  </div>
</template>
