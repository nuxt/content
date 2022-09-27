import { defineComponent, createApp, h } from 'vue'
import { defineNuxtPlugin, useRoute, useCookie, refreshNuxtData, useRuntimeConfig } from '#imports'

const previewApp = ref(null)
const PreviewBar = defineComponent({
  setup () {
    // http://localhost:3001/?preview=c2b1e310ede97d22bd29efae64599b0f
    const exitPreview = async () => {
      useCookie('previewToken').value = ''
      useRoute().query.preview = ''
      await navigateTo(useRoute().path)
      nextTick(() => {
        refreshNuxtData()
        previewApp.value.unmount()
      })
    }
    return () => h('div', {
      style: {
        position: 'fixed',
        fontSize: '16px',
        bottom: '0',
        width: '100%',
        background: '#222',
        borderTop: '1px solid #333',
        padding: '0.3rem 1rem',
        display: 'flex',
        justifyContent: 'center'
      }
    }, [
      h('span', 'You are in preview mode. '),
      h('button', {
        style: {
          fontSize: '16px',
          width: 'auto',
          background: 'none',
          textDecoration: 'underline',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          margin: '0 0.5rem',
          padding: '0'
        },
        onClick: exitPreview
      }, ' Click here to exit preview mode')
    ])
  }
})

export default defineNuxtPlugin((nuxt) => {
  const { baseURL } = useRuntimeConfig().public.studio

  async function initializePreview () {
    const query = useRoute().query || {}
    const previewToken = useCookie('previewToken')
    if (!query.preview && !previewToken.value) {
      return
    }
    if (!previewToken.value) {
      previewToken.value = String(query.preview)
    }

    // Show loading
    const el = document.createElement('div')
    el.id = 'nuxt-content-preview'
    previewApp.value = createApp(PreviewBar)
    previewApp.value.mount(el)
    document.body.appendChild(el)

    // Fetch preview data from station
    const data = await $fetch('projects/preview', {
      baseURL,
      params: {
        token: previewToken.value
      }
    })
    // Fill store with preview content
    const items = [
      ...data.additions,
      ...data.deletions.map(d => ({ ...d, parsed: { _id: d.path.replace(/\//g, ':'), __deleted: true } }))
    ]
    for (const item of items) {
      window.localStorage.setItem(`@content:${previewToken.value}:${item.parsed._id}`, JSON.stringify(item.parsed))
    }
  }

  nuxt.hook('app:mounted', async () => {
    await initializePreview()
  })

  nuxt.hook('page:finish', () => {
    // Refresh nuxt data
    // eslint-disable-next-line no-console
    console.log('[Content] Refreshing nuxt data')
    refreshNuxtData()
  })
})
