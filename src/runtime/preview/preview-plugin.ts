import { createApp } from 'vue'
import { defineNuxtPlugin, useRoute, useCookie, refreshNuxtData, useRuntimeConfig, useNuxtApp } from '#imports'
import { ContentPreviewMode } from '#components'

export default defineNuxtPlugin((nuxt) => {
  const { previewAPI } = useRuntimeConfig().public.content

  async function fetchData (token: string, contentStorage) {
    // Fetch preview data from station
    const data = await $fetch('api/projects/preview', {
      baseURL: previewAPI,
      params: {
        token
      }
    })
    // Remove previous preview data
    const keys = await contentStorage.getKeys(`${token}:`)
    await Promise.all(keys.map(key => contentStorage.removeItem(key)))

    // Set preview meta
    await contentStorage.setItem(
      `${token}$`,
      JSON.stringify({
        ignoreBuiltContents: (data.files || []).length !== 0
      })
    )

    // Fill store with preview content
    const items = [
      ...(data.files || []),
      ...data.additions,
      ...data.deletions.map(d => ({ ...d, parsed: { _id: d.path.replace(/\//g, ':'), __deleted: true } }))
    ]

    await Promise.all(
      items.map(item => contentStorage.setItem(`${token}:${item.parsed._id}`, JSON.stringify(item.parsed)))
    )
  }

  function initializePreview () {
    let contentStorage
    const nuxtApp = useNuxtApp()
    const query = useRoute().query || {}
    const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })
    if (!query.preview && !previewToken.value) {
      return
    }
    if (query.preview && previewToken.value !== query.preview) {
      previewToken.value = String(query.preview)
    }

    // Show loading
    const el = document.createElement('div')
    el.id = 'nuxt-content-preview'
    document.body.appendChild(el)
    createApp(ContentPreviewMode, {
      previewToken,
      apiURL: previewAPI,
      onRefresh: () => fetchData(previewToken.value, contentStorage).then(() => refreshNuxtData())
    }).mount(el)

    // @ts-ignore
    nuxtApp.hook('content:storage', async (storage) => {
      contentStorage = storage
      await fetchData(previewToken.value, contentStorage)
      refreshNuxtData()
    })
  }

  nuxt.hook('app:mounted', async () => {
    await initializePreview()
  })

  nuxt.hook('page:finish', () => {
    // Refresh nuxt data
    refreshNuxtData()
  })
})
