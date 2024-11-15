import { createApp } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'
import type { AppConfig } from 'nuxt/schema'
import type { TransformedContent } from '@nuxt/content'
import StudioPreviewMode from '../components/StudioPreviewMode.vue'
import { FileMessageType, type FileChangeMessagePayload, type FileMessageData, type FileSelectMessagePayload, type DraftSyncData, type PreviewFile } from '../../types/studio'
import { createSingleton, deepAssign, deepDelete, defu, generateStemFromPath, mergeDraft, StudioConfigFiles } from '../../utils/studio'
import { loadDatabaseAdapter } from '../internal/database.client'
import { generateCollectionInsert, generateRecordSelectByColumn, generateRecordUpdate } from '../../utils/studio/query'
import { getCollectionByPath, v2ToV3ParsedFile } from '../../utils/studio/compatibility'
import { callWithNuxt, refreshNuxtData } from '#app'
import { useAppConfig, useNuxtApp, useRuntimeConfig, ref, toRaw, useRoute, useRouter } from '#imports'
import { collections } from '#content/studio'

const initialAppConfig = createSingleton(() => JSON.parse(JSON.stringify((useAppConfig()))))

const initializePreview = async (data: DraftSyncData) => {
  const mergedFiles = mergeDraft(data.files, data.additions, data.deletions)

  // // Handle content files
  const contentFiles = mergedFiles.filter(item => !([StudioConfigFiles.appConfig, StudioConfigFiles.appConfigV4, StudioConfigFiles.nuxtConfig].includes(item.path)))

  // Initialize db with preview files
  for (const file of contentFiles) {
    // Fetch corresponding collection
    const collection = getCollectionByPath(file.path, collections)
    if (!collection) {
      console.warn(`Studio Preview: collection not found for file: ${file.path}, skipping insertion.`)
      return
    }

    const v3File = v2ToV3ParsedFile(file, collection)

    const query = generateCollectionInsert(collection, v3File)

    const db = loadDatabaseAdapter(collection.name)

    // Define table
    await db.exec(collection.tableDefinition)

    // Insert preview files
    await db.exec(query)

    // window.db = db
  }

  // const appConfig = mergedFiles.find(item => [StudioConfigFiles.appConfig, StudioConfigFiles.appConfigV4].includes(item.path))
  // syncPreviewAppConfig(appConfig?.parsed)

  refreshNuxtData()

  // return true
}

const syncPreviewAppConfig = (appConfig?: any) => {
  const nuxtApp = useNuxtApp()

  const _appConfig = callWithNuxt(nuxtApp, useAppConfig) as AppConfig

  // Using `defu` to merge with initial config
  // This is important to revert to default values for missing properties
  deepAssign(_appConfig, defu(appConfig, initialAppConfig))

  // Reset app config to initial state if no appConfig is provided
  // Makes sure that app config does not contain any preview data
  if (!appConfig) {
    deepDelete(_appConfig, initialAppConfig)
  }
}

export function mountPreviewUI() {
  const { studio } = useRuntimeConfig().public

  const previewToken = window.sessionStorage.getItem('previewToken')
  // Show loading
  const el = document.createElement('div')
  el.id = '__nuxt_preview_wrapper'
  document.body.appendChild(el)
  createApp(StudioPreviewMode, {
    previewToken,
    apiURL: window.sessionStorage.getItem('previewAPI') || studio?.apiURL,
    initializePreview,
  }).mount(el)
}

export function initIframeCommunication() {
  const nuxtApp = useNuxtApp()
  const { studio } = useRuntimeConfig().public

  // Not in an iframe
  if (!window.parent || window.self === window.parent) {
    return
  }

  const router = useRouter()
  const route = useRoute()

  const editorSelectedPath = ref('')

  // Evaluate route payload
  const routePayload = (route: RouteLocationNormalized) => ({
    path: route.path,
    query: toRaw(route.query),
    params: toRaw(route.params),
    fullPath: route.fullPath,
    meta: toRaw(route.meta),
  })

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
      window.parent.postMessage({
        type: 'nuxt-studio:preview:keydown',
        payload: {
          key: e.key,
          metaKey: e.metaKey,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
        },
      }, '*')
    }
  })

  window.addEventListener('message', async (e: { data: FileMessageData }) => {
    // IFRAME_MESSAGING_ALLOWED_ORIGINS format must be a comma separated string of allowed origins
    const allowedOrigins = studio?.iframeMessagingAllowedOrigins?.split(',').map((origin: string) => origin.trim()) || []
    if (!['https://nuxt.studio', 'https://new.nuxt.studio', 'https://new.dev.nuxt.studio', 'https://dev.nuxt.studio', 'http://localhost:3000', ...allowedOrigins].includes(e.origin)) {
      return
    }

    console.log('------------ MESSAGE RECEIVED ------------')
    console.log('TYPE :', e.data.type)
    console.log('PAYLOAD :', e.data.payload)
    console.log('------------------------------------------')
    const { type, payload = {}, navigate } = e.data || {}

    switch (type) {
      case FileMessageType.FileSelected: {
        await handleFileSelection(payload as FileSelectMessagePayload)
        break
      }
      case FileMessageType.FileChanged:
      case FileMessageType.MediaChanged: {
        const { additions = [], deletions = [] } = payload as FileChangeMessagePayload
        for (const addition of additions) {
          await handleFileUpdate(addition, navigate)
        }
        for (const deletion of deletions) {
          console.log('deletion :', deletion)
          // TODO
          // await removeContentItem(previewToken, deletion.path)
        }

        rerenderPreview()
        break
      }
      case 'nuxt-studio:config:file-changed': {
        const { additions = [], deletions = [] } = payload as FileChangeMessagePayload

        const appConfig = additions.find(item => [StudioConfigFiles.appConfig, StudioConfigFiles.appConfigV4].includes(item.path))
        if (appConfig) {
          syncPreviewAppConfig(appConfig?.parsed)
        }
        const shouldRemoveAppConfig = deletions.find(item => [StudioConfigFiles.appConfig, StudioConfigFiles.appConfigV4].includes(item.path))
        if (shouldRemoveAppConfig) {
          syncPreviewAppConfig(undefined)
        }
      }
    }

    async function handleFileSelection(payload: FileSelectMessagePayload) {
      // Removing `content/` prefix only if path is starting with content/
      const path = payload.path?.startsWith('content/') ? payload.path.split('/').slice(1).join('/') : payload.path

      const collection = getCollectionByPath(path, collections)
      if (!collection) {
        console.warn(`Studio Preview: collection not found for file: ${path}, skipping navigation.`)
        return
      }

      // Load db
      const db = loadDatabaseAdapter(collection.name)
      // Only navigate to pages
      if (collection.type !== 'page') {
        return
      }

      // Generate stem (path without extension)
      const stem = generateStemFromPath(path)

      const query = generateRecordSelectByColumn(collection, 'stem', stem)

      const file: TransformedContent = await db.first(query)

      // Do not navigate to another page if file is not found
      // This makes sure that user stays on the same page when navigation through directories in the editor
      if (!file) {
        return
      }

      // Ensure that the content is related to a valid route
      const resolvedRoute = router.resolve(file.path)
      if (!resolvedRoute || !resolvedRoute.matched || resolvedRoute.matched.length === 0) {
        return
      }

      // Navigate to the selected content
      if (file.path !== useRoute().path) {
        editorSelectedPath.value = file.path as string
        router.push(file.path)
      }
    }

    async function handleFileUpdate(file: PreviewFile, navigate: boolean) {
      const collection = getCollectionByPath(file.path, collections)
      if (!collection) {
        console.warn(`Studio Preview: collection not found for file: ${file.path}, skipping update.`)
        return
      }

      const stem = generateStemFromPath(file.path)

      const v3File = v2ToV3ParsedFile({ path: file.path, parsed: file.parsed }, collection)

      const query = generateRecordUpdate(collection, stem, v3File)

      const db = loadDatabaseAdapter(collection.name)

      await db.exec(query)

      // TODO
      console.log('navigate :', navigate)

      // Navigate to the updated content if not already on the page
      if (navigate && file.path !== useRoute().path) {
        // Ensure that the content is related to a valid route
        const resolvedRoute = router.resolve(file.path)
        if (!resolvedRoute || !resolvedRoute.matched || resolvedRoute.matched.length === 0) {
          return
        }

        editorSelectedPath.value = file.path as string
        router.push(file.path)
      }
    }
  })

  nuxtApp.hook('page:finish', () => {
    // detectRenderedContents()

    // if (nuxtApp.payload.prerenderedAt) {
    //   rerenderPreview()
    // }
  })

  // TODO check with ahad
  // // @ts-expect-error custom hook
  // nuxtApp.hook('content:document-driven:finish', ({ route, page }) => {
  //   route.meta.studio_page_contentId = page?._id
  // })

  // @ts-expect-error custom hook
  nuxtApp.hook('nuxt-studio:preview:ready', () => {
    window.parent.postMessage({
      type: 'nuxt-studio:preview:ready',
      payload: routePayload(useRoute()),
    }, '*')

    // setTimeout(() => {
    //   // Initial sync
    //   detectRenderedContents()
    // }, 100)
  })

  // Inject Utils to window
  // function detectRenderedContents() {
  //   const renderedContents = Array.from(window.document.querySelectorAll('[data-content-id]'))
  //     .map(el => el.getAttribute('data-content-id')!)

  //   console.log('Detect rendered contents :', renderedContents)

  //   const contentIds = Array
  //     .from(new Set([route.meta.studio_page_contentId as string, ...renderedContents]))
  //     .filter(Boolean)

  //   if (editorSelectedPath.value === contentIds[0]) {
  //     editorSelectedPath.value = ''
  //     return
  //   }

  //   window.openFileInStudio(contentIds, { navigate: true, pageContentId: route.meta.studio_page_contentId as string })
  // }

  window.openFileInStudio = (contentIds: string[], data = {}) => {
    window.parent.postMessage({
      type: 'nuxt-studio:preview:navigate',
      payload: {
        ...routePayload(route),
        contentIds,
        ...data,
      },
    }, '*')
  }
}

async function rerenderPreview() {
  await useNuxtApp().hooks.callHookParallel('app:data:refresh')
}
