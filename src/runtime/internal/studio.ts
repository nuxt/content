import { createApp } from 'vue'
import type { AppConfig } from 'nuxt/schema'
import type { TransformedContent } from '@nuxt/content'
import { withLeadingSlash } from 'ufo'
import StudioPreviewMode from '../components/StudioPreviewMode.vue'
import { FileMessageType, type FileChangeMessagePayload, type FileMessageData, type FileSelectMessagePayload, type DraftSyncData, type PreviewFile } from '../../types/studio'
import { createSingleton, deepAssign, deepDelete, defu, generateStemFromPath, mergeDraft, StudioConfigFiles, withoutRoot } from '../../utils/studio'
import { loadDatabaseAdapter } from '../internal/database.client'
import { getCollectionByPath, generateCollectionInsert, generateRecordDeletion, generateRecordSelectByColumn, generateRecordUpdate } from '../../utils/studio/collection'
import { v2ToV3ParsedFile } from '../../utils/studio/compatibility'
import { callWithNuxt, refreshNuxtData } from '#app'
import { useAppConfig, useNuxtApp, useRuntimeConfig, useRoute, useRouter } from '#imports'
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
        await handleFileSelection((payload as FileSelectMessagePayload).path)
        break
      }
      case FileMessageType.FileChanged:
      case FileMessageType.MediaChanged: {
        const { additions = [], deletions = [] } = payload as FileChangeMessagePayload
        for (const addition of additions) {
          await handleFileUpdate(addition, navigate)
        }
        for (const deletion of deletions) {
          await handleFileDeletion(deletion.path)
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

    async function handleFileSelection(path: string) {
      const collection = getCollectionByPath(withoutRoot(path), collections)
      if (!collection) {
        console.warn(`Studio Preview: collection not found for file: ${path}, skipping navigation.`)
        return
      }

      // Only navigate to pages
      if (collection.type !== 'page') {
        return
      }

      // Load db
      const db = loadDatabaseAdapter(collection.name)

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
      if (file.path !== route.path) {
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

      // Only navigate to pages
      if (collection.type !== 'page' || !file.pathRoute) {
        return
      }

      // Navigate to the updated content if not already on the page
      const updatedPath = withLeadingSlash(file.pathRoute)
      if (navigate && updatedPath !== route.path) {
        // Ensure that the content is related to a valid route
        const resolvedRoute = router.resolve(updatedPath)
        if (!resolvedRoute || !resolvedRoute.matched || resolvedRoute.matched.length === 0) {
          return
        }

        router.push(updatedPath)
      }
    }

    async function handleFileDeletion(path: string) {
      const collection = getCollectionByPath(withoutRoot(path), collections)
      if (!collection) {
        console.warn(`Studio Preview: collection not found for file: ${path}, skipping deletion.`)
        return
      }

      const stem = generateStemFromPath(path)

      const query = generateRecordDeletion(collection, stem)

      const db = loadDatabaseAdapter(collection.name)

      await db.exec(query)
    }
  })

  async function selectCurrentRouteOnStudio() {
    const currentPath = route.path

    const collection = getCollectionByPath(currentPath, collections)
    if (!collection || collection.type !== 'page') {
      return
    }

    const db = loadDatabaseAdapter(collection.name)

    const query = generateRecordSelectByColumn(collection, 'path', currentPath)

    const file: TransformedContent = await db.first(query)
    if (!file || !file.path) {
      return
    }

    window.openFileInStudio(currentPath)
  }

  nuxtApp.hook('page:finish', () => {
    selectCurrentRouteOnStudio()
  })

  // @ts-expect-error custom hook
  nuxtApp.hook('nuxt-studio:preview:ready', () => {
    window.parent.postMessage({ type: 'nuxt-studio:preview:ready' }, '*')
  })

  // Inject utils to window
  window.openFileInStudio = (path: string) => {
    window.parent.postMessage({
      type: 'nuxt-studio:preview:navigate',
      payload: { path },
    }, '*')
  }
}

async function rerenderPreview() {
  await useNuxtApp().hooks.callHookParallel('app:data:refresh')
}
