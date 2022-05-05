<script setup>
import { onMounted } from 'vue'

const { previewToken } = defineProps({
  previewToken: {
    type: Object,
    required: true
  }
})
const open = ref(true)
const refreshing = ref(false)
const closePreviewMode = () => {
  open.value = false
  previewToken.value = null
}
onMounted(async () => {
  const io = await import('socket.io-client')
  const socket = io.connect(`http://localhost:1337/preview:${previewToken.value}`, {
    transports: ['websocket', 'polling']
  })

  socket.on('draft:update', async () => {
    refreshing.value = true
    await refreshNuxtData()
    refreshing.value = false
  })
})
</script>

<template>
  <div v-if="open" class="preview">
    Preview mode activated. <button @click="closePreviewMode">
      close
    </button>{{ refreshing? 'Refreshing...' : '' }}
  </div>
</template>

<style scoped>
.preview {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: black;
  color: white;
  padding: 10px;
}
.preview button {
  border: 1px white solid;
  padding: 2px 4px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
  margin-left: 5px;
  margin-right: 8px;
}
</style>
