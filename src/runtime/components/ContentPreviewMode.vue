<script setup>
import { onMounted } from 'vue'

const { previewToken, apiURL } = defineProps({
  previewToken: {
    type: Object,
    required: true
  },
  apiURL: {
    type: String,
    required: true
  }
})
const open = ref(true)
const refreshing = ref(false)
const ready = ref(false)
const closePreviewMode = () => {
  open.value = false
  previewToken.value = null
  refreshNuxtData()
}
onMounted(async () => {
  const io = await import('socket.io-client')
  const socket = io.connect(`${apiURL}/preview:${previewToken.value}`, {
    transports: ['websocket', 'polling']
  })
  ready.value = true

  socket.on('draft:update', async () => {
    refreshing.value = true
    await refreshNuxtData()
    refreshing.value = false
  })
})
</script>

<template>
  <div v-if="open" id="__nuxt_preview" :class="{ __preview_ready: ready }">
    <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50.0016 71.0999h29.2561c.9293.0001 1.8422-.241 2.6469-.6992.8047-.4582 1.4729-1.1173 1.9373-1.9109.4645-.7936.7088-1.6939.7083-2.6102-.0004-.9162-.2455-1.8163-.7106-2.6095L64.192 29.713c-.4644-.7934-1.1325-1.4523-1.937-1.9105-.8046-.4581-1.7173-.6993-2.6463-.6993-.9291 0-1.8418.2412-2.6463.6993-.8046.4582-1.4726 1.1171-1.937 1.9105l-5.0238 8.5861-9.8224-16.7898c-.4648-.7934-1.1332-1.4522-1.938-1.9102-.8047-.4581-1.7176-.6992-2.6468-.6992-.9292 0-1.842.2411-2.6468.6992-.8048.458-1.4731 1.1168-1.9379 1.9102L6.56062 63.2701c-.46512.7932-.71021 1.6933-.71061 2.6095-.00041.9163.24389 1.8166.70831 2.6102.46443.7936 1.1326 1.4527 1.93732 1.9109.80473.4582 1.71766.6993 2.64686.6992h18.3646c7.2763 0 12.6422-3.1516 16.3345-9.3002l8.9642-15.3081 4.8015-8.1925 14.4099 24.6083H54.8058l-4.8042 8.1925ZM29.2077 62.899l-12.8161-.0028L35.603 30.0869l9.5857 16.4047-6.418 10.9645c-2.4521 3.9894-5.2377 5.4429-9.563 5.4429Z" fill="currentColor" />
    </svg>
    Preview mode enabled
    <button @click="closePreviewMode">
      Close
    </button>{{ refreshing? 'Refreshing...' : '' }}
  </div>
</template>

<style>
body {
  margin-bottom: 60px;
}
#__nuxt_preview {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-family: Helvetica, sans-serif;
  font-weight: 500;
  position: fixed;
  bottom: -60px;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.8);
  color: black;
  backdrop-filter: blur(20px);
  border-top: 1px #eee solid;
  transition: bottom 0.3s ease-in-out;
}
#__nuxt_preview.__preview_ready {
  bottom: 0;
}
.dark #__nuxt_preview,
.dark-mode #__nuxt_preview {
  background: rgba(0, 0, 0, 0.8);
  border-top: 1px #111 solid;
  color: white;
}
#__nuxt_preview svg {
  display: inline-block;
  width: 30px;
  height: 30px;
  color: black;
}
.dark #__nuxt_preview svg,
.dark-mode #__nuxt_preview svg {
  color: white;
}
#__nuxt_preview button {
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 4px 10px;
  border-radius: 5px;
  background: transparent;
  margin-left: 5px;
  margin-right: 8px;
  color: rgba(0, 0, 0, 0.8);
}
#__nuxt_preview button:hover,
#__nuxt_preview button:focus {
  background: rgba(0, 0, 0, 0.1);
}
#__nuxt_preview button:active {
  background: rgba(0, 0, 0, 0.2);
}
.dark #__nuxt_preview button,
.dark-mode #__nuxt_preview button {
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
}
.dark #__nuxt_preview button:hover,
.dark #__nuxt_preview button:hover,
.dark-mode #__nuxt_preview button:focus,
.dark-mode #__nuxt_preview button:focus {
  background: rgba(255, 255, 255, 0.1);
}
.dark #__nuxt_preview button:active,
.dark-mode #__nuxt_preview button:active {
  background: rgba(255, 255, 255, 0.2);
}
</style>
