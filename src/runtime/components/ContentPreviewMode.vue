<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import type { Socket } from 'socket.io-client'
import type { DraftSyncData } from '@nuxt/content'
import { useCookie, useNuxtApp, useRouter } from '#app'

const props = defineProps({
  previewToken: {
    type: String,
    required: true,
  },
  api: {
    type: String,
    required: true,
  },
  initializePreview: {
    type: Function,
    required: true,
  },
})

const previewClasses = ['__nuxt_preview', '__preview_enabled']

const nuxtApp = useNuxtApp()
const router = useRouter()
const open = ref(true)
const refreshing = ref(false)
const previewReady = ref(false)
const error = ref('')
let socket: Socket

const closePreviewMode = async () => {
  // Remove preview token from cookie and session storage
  useCookie('previewToken').value = ''
  window.sessionStorage.removeItem('previewToken')
  window.sessionStorage.removeItem('previewAPI')

  // Remove query params in url to refresh page
  await router.replace({ query: { preview: undefined } })

  // Reload page to fully exit preview mode
  window.location.reload()
}

const init = async (data: DraftSyncData) => {
  // Initialize browser db with the data received
  await props.initializePreview(data)

  // Ensure that preview token is set in cookie
  // This is needed for cases that user wants to exit preview mode before preview is ready
  if (!useCookie('previewToken').value) {
    return
  }

  previewReady.value = true

  // Remove query params in url to refresh page (in case of 404 with no SPA fallback)
  await router.replace({ query: {} })

  // @ts-expect-error custom hook => keep this for typecheck in project using the module
  nuxtApp.callHook('nuxt-content:preview:ready')

  if (window.parent && window.self !== window.parent) {
    socket.disconnect()
  }
}

onMounted(async () => {
  const io = await import('socket.io-client')
  socket = io.connect(`${props.api}/preview`, {
    transports: ['websocket', 'polling'],
    auth: {
      token: props.previewToken,
    },
  })

  let syncTimeout: ReturnType<typeof setTimeout> | null
  socket.on('connect', () => {
    syncTimeout = setTimeout(() => {
      if (!previewReady.value) {
        syncTimeout = setTimeout(() => {
          error.value = 'Preview sync timed out'
          previewReady.value = false
        }, 30000)

        socket.emit('draft:requestSync')
      }
    }, 30000)
  })

  const clearSyncTimeout = () => {
    if (syncTimeout) {
      clearTimeout(syncTimeout)
      syncTimeout = null
    }
  }

  // Client should receive `draft:sync` once the draft has been send for the first time
  socket.on('draft:sync', async (data: DraftSyncData) => {
    clearSyncTimeout()

    // If no data is received, it means the draft is not ready yet
    if (!data) {
      // Request draft sync via Preview API
      try {
        // Wait for draft:ready and then request sync to get the data back with 'draft:ready'
        socket.once('draft:ready', () => {
          socket.emit('draft:requestSync')
        })

        // Request preview sync from Preview API
        await $fetch('api/projects/preview/sync', {
          baseURL: props.api,
          method: 'POST',
          params: {
            token: props.previewToken,
          },
        })
      }
      catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        clearSyncTimeout()

        switch (e.response.status) {
          case 404:
            error.value = 'Preview draft not found'
            previewReady.value = false
            break
          default:
            error.value = 'An error occurred while syncing preview'
            previewReady.value = false
        }
      }
      return
    }

    init(data)
  })

  socket.on('draft:unauthorized', () => {
    clearSyncTimeout()
    error.value = 'Unauthorized preview'
    previewReady.value = false
  })

  socket.on('disconnect', () => {
    clearSyncTimeout()
  })

  // Adds body classes for live preview
  document.body.classList.add(...previewClasses)

  // socket.on('draft:update', (data) => {
  //   refreshing.value = true
  //   props.syncPreview(data)
  //   refreshing.value = false
  // })
})

// Also cleans up body classes on unMounted
onUnmounted(() => {
  document.body.classList.remove(...previewClasses)
})

// async function requestPreviewSync() {
//   await $fetch('api/projects/preview/sync', {
//     baseURL: props.api,
//     method: 'POST',
//     params: {
//       token: props.previewToken,
//     },
//   })
// }
</script>

<template>
  <div>
    <div
      v-if="open"
      id="__nuxt_preview"
      :class="{ __preview_ready: previewReady, __preview_refreshing: refreshing }"
    >
      <template v-if="previewReady">
        <svg
          viewBox="0 0 90 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50.0016 71.0999h29.2561c.9293.0001 1.8422-.241 2.6469-.6992.8047-.4582 1.4729-1.1173 1.9373-1.9109.4645-.7936.7088-1.6939.7083-2.6102-.0004-.9162-.2455-1.8163-.7106-2.6095L64.192 29.713c-.4644-.7934-1.1325-1.4523-1.937-1.9105-.8046-.4581-1.7173-.6993-2.6463-.6993-.9291 0-1.8418.2412-2.6463.6993-.8046.4582-1.4726 1.1171-1.937 1.9105l-5.0238 8.5861-9.8224-16.7898c-.4648-.7934-1.1332-1.4522-1.938-1.9102-.8047-.4581-1.7176-.6992-2.6468-.6992-.9292 0-1.842.2411-2.6468.6992-.8048.458-1.4731 1.1168-1.9379 1.9102L6.56062 63.2701c-.46512.7932-.71021 1.6933-.71061 2.6095-.00041.9163.24389 1.8166.70831 2.6102.46443.7936 1.1326 1.4527 1.93732 1.9109.80473.4582 1.71766.6993 2.64686.6992h18.3646c7.2763 0 12.6422-3.1516 16.3345-9.3002l8.9642-15.3081 4.8015-8.1925 14.4099 24.6083H54.8058l-4.8042 8.1925ZM29.2077 62.899l-12.8161-.0028L35.603 30.0869l9.5857 16.4047-6.418 10.9645c-2.4521 3.9894-5.2377 5.4429-9.563 5.4429Z"
            fill="currentColor"
          />
        </svg>
        <span>Preview enabled</span>
        <button @click="closePreviewMode">
          Close
        </button>
      </template>
    </div>
    <Transition name="preview-loading">
      <div v-if="open && !previewReady && !error">
        <div id="__preview_background" />
        <div id="__preview_loader">
          <svg
            id="__preview_loading_icon"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"
            />
          </svg>
          <p>Initializing the preview...</p>
          <button @click="closePreviewMode">
            Cancel
          </button>
        </div>
      </div>
    </Transition>
    <Transition name="preview-loading">
      <div v-if="error">
        <div id="__preview_background" />
        <div id="__preview_loader">
          <p>{{ error }}</p>
          <button @click="closePreviewMode">
            Exit preview
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
body.__preview_enabled {
  padding-bottom: 50px;
}
</style>

<style scoped>
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
  background: rgba(255, 255, 255, 0.3);
  color: black;
  backdrop-filter: blur(20px);
  border-top: 1px #eee solid;
  transition: bottom 0.3s ease-in-out;
  font-size: 16px;
  z-index: 10000;
}
#__nuxt_preview.__preview_ready {
  bottom: 0;
}

#__preview_background {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9000;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
}

#__preview_loader {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.4rem;
  z-index: 9500;
  color: black;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
#__preview_loader p {
  margin: 10px 0;
}

.dark #__preview_background,
.dark-mode #__preview_background {
  background: rgba(0, 0, 0, 0.3);
}
.dark #__preview_loader,
.dark-mode #__preview_loader {
  color: white;
}

.preview-loading-enter-active,
.preview-loading-leave-active {
  transition: opacity 0.4s;
}
.preview-loading-enter,
.preview-loading-leave-to {
  opacity: 0;
}

#__preview_loading_icon {
  animation: spin 1s linear infinite;
}

.dark #__nuxt_preview,
.dark-mode #__nuxt_preview {
  background: rgba(0, 0, 0, 0.3);
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
button {
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 4px 10px;
  border-radius: 3px;
  background: transparent;
  margin-left: 5px;
  margin-right: 8px;
  color: rgba(0, 0, 0, 0.8);
  font-size: 14px;
  line-height: 1rem;
  transition: none;
  text-align: center;
  font-weight: normal;
  box-shadow: none;
  display: inline-block;
  width: auto;
  margin: 0;
}
button:hover {
  color: rgba(0, 0, 0, 0.9);
  border-color: rgba(0, 0, 0, 0.4);
}
.dark-mode button,
.dark button {
  color: lightgray;
  border-color: rgba(255, 255, 255, 0.2)
}
.dark-mode button:hover,
.dark button:hover {
  color: white;
  border-color: rgba(255, 255, 255, 0.4)
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

a {
  font-weight: 600;
}
#__nuxt_preview.__preview_refreshing svg,
#__nuxt_preview.__preview_refreshing span,
#__nuxt_preview.__preview_refreshing button {
  animation: nuxt_pulsate 1s ease-out;
  animation-iteration-count: infinite;
  opacity: 0.5;
}
@keyframes nuxt_pulsate {
  0% {
      opacity: 1;
  }
  50% {
      opacity: 0.5;
  }
  100% {
      opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
</style>
