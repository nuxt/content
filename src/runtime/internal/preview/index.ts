import { createApp } from 'vue'
import type { AppConfig } from 'nuxt/schema'
import { withLeadingSlash } from 'ufo'
import ContentPreviewMode from '../../components/ContentPreviewMode.vue'
import { loadDatabaseAdapter } from '../database.client'
import { v2ToV3ParsedFile } from './compatibility'
import { getCollectionByFilePath, generateCollectionInsert, generateRecordDeletion, generateRecordSelectByColumn, generateRecordUpdate, getCollectionByRoutePath } from './collection'
import { createSingleton, deepAssign, deepDelete, defu, generateStemFromPath, mergeDraft, PreviewConfigFiles, withoutRoot } from './utils'
import { officialProviderUrls } from './providers'
import type { PublicRuntimeConfig, CollectionInfo, FileChangeMessagePayload, FileMessageData, FileSelectMessagePayload, DraftSyncData, PreviewFile, DraftSyncFile } from '@nuxt/content'
import { callWithNuxt, refreshNuxtData } from '#app'
import { useAppConfig, useNuxtApp, useRuntimeConfig, useRoute, useRouter, ref } from '#imports'
import { collections } from '#content/preview'

const dbReady = ref(false)
const initialAppConfig = createSingleton(() => JSON.parse(JSON.stringify((useAppConfig()))))

const initializePreview = async (data: DraftSyncData) => {
  const mergedFiles = mergeDraft(data.files, data.additions, data.deletions)

  // // Handle content files
  const contentFiles = mergedFiles.filter(item => !([PreviewConfigFiles.appConfig, PreviewConfigFiles.appConfigV4, PreviewConfigFiles.nuxtConfig].includes(item.path)))

  // Initialize collection tables
  for (const collection of Object.values(collections as Record<string, CollectionInfo>)) {
    const db = loadDatabaseAdapter(collection.name)
    await db.exec(collection.tableDefinition)
  }

  // Initialize db with preview files
  for (const file of contentFiles) {
    await syncDraftFile(collections, file)
  }

  const appConfig = mergedFiles.find(item => [PreviewConfigFiles.appConfig, PreviewConfigFiles.appConfigV4].includes(item.path))
  if (appConfig) {
    syncDraftAppConfig(appConfig.parsed)
  }

  refreshNuxtData()

  dbReady.value = true
}

const syncDraftFile = async (collections: Record<string, CollectionInfo>, file: DraftSyncFile) => {
  // Fetch corresponding collection
  const { collection, matchedSource } = getCollectionByFilePath(file.path, collections)
  if (!collection || !matchedSource) {
    console.warn(`Content Preview: collection not found for file: ${file.path}, skipping insertion.`)
    return
  }

  const db = loadDatabaseAdapter(collection.name)

  const v3File = v2ToV3ParsedFile(file, collection, matchedSource)!

  const query = generateCollectionInsert(collection, v3File)

  await db.exec(query)
}

const syncDraftAppConfig = (appConfig?: Record<string, unknown>) => {
  const nuxtApp = useNuxtApp()

  const _appConfig = callWithNuxt(nuxtApp, useAppConfig) as AppConfig

  // Using `defu` to merge with initial config
  // This is important to revert to default values for missing properties
  deepAssign(_appConfig, defu(appConfig || {}, initialAppConfig))

  // Reset app config to initial state if no appConfig is provided
  // Makes sure that app config does not contain any preview data
  if (!appConfig) {
    // @ts-expect-error -- TODO fix type
    deepDelete(_appConfig, initialAppConfig)
  }
}

export function mountPreviewUI() {
  const previewConfig: PublicRuntimeConfig['preview'] = useRuntimeConfig().public.preview || {}

  const previewToken = window.sessionStorage.getItem('previewToken')
  // Show loading
  const el = document.createElement('div')
  el.id = '__nuxt_preview_wrapper'
  document.body.appendChild(el)
  createApp(ContentPreviewMode, {
    previewToken,
    api: window.sessionStorage.getItem('previewAPI') || previewConfig?.api,
    initializePreview,
  }).mount(el)
}

export function initIframeCommunication() {
  const nuxtApp = useNuxtApp()
  const previewConfig = useRuntimeConfig().public.preview as PublicRuntimeConfig['preview']

  // Not in an iframe
  if (!window.parent || window.self === window.parent) {
    return
  }

  const router = useRouter()
  const route = useRoute()

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
      window.parent.postMessage({
        type: 'nuxt-content:preview:keydown',
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

  window.addEventListener('message', async (e: { origin: string, data: FileMessageData }) => {
    if (!dbReady.value) {
      return
    }

    // PREVIEW_ALLOWED_ORIGINS format must be a comma separated string of allowed origins
    const allowedOrigins = previewConfig?.iframeMessagingAllowedOrigins?.split(',').map((origin: string) => origin.trim()) || []
    if (![
      'http://localhost:3000',
      ...officialProviderUrls,
      ...allowedOrigins,
    ].includes(e.origin)) {
      return
    }

    const { type, payload = {}, navigate } = e.data || {}

    switch (type) {
      case 'nuxt-content:editor:file-selected': {
        await handleFileSelection((payload as FileSelectMessagePayload).path)
        break
      }
      case 'nuxt-content:editor:file-changed':
      case 'nuxt-content:editor:media-changed': {
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
      case 'nuxt-content:config:file-changed': {
        const { additions = [], deletions = [] } = payload as FileChangeMessagePayload

        const appConfig = additions.find(item => [PreviewConfigFiles.appConfig, PreviewConfigFiles.appConfigV4].includes(item.path))
        if (appConfig) {
          syncDraftAppConfig(appConfig?.parsed)
        }
        const shouldRemoveAppConfig = deletions.find(item => [PreviewConfigFiles.appConfig, PreviewConfigFiles.appConfigV4].includes(item.path))
        if (shouldRemoveAppConfig) {
          syncDraftAppConfig(undefined)
        }
      }
    }

    async function handleFileSelection(path: string) {
      if (!path) {
        return
      }

      const { collection } = getCollectionByFilePath(withoutRoot(path), collections)
      if (!collection) {
        console.warn(`Content Preview: collection not found for file: ${path}, skipping navigation.`)
        return
      }

      // Only navigate to pages
      if (collection.type !== 'page') {
        return
      }

      const db = loadDatabaseAdapter(collection.name)

      const stem = generateStemFromPath(path)

      const query = generateRecordSelectByColumn(collection, 'stem', stem)

      const file = await db.first(query) as { path: string }

      // Do not navigate to another page if file is not found
      // This makes sure that user stays on the same page when navigation through directories in the editor
      if (!file || !file.path) {
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
      const { collection, matchedSource } = getCollectionByFilePath(file.path, collections)
      if (!collection || !matchedSource) {
        console.warn(`Content Preview: collection not found for file: ${file.path}, skipping update.`)
        return
      }

      const stem = generateStemFromPath(file.path)

      const v3File = v2ToV3ParsedFile({ path: file.path, parsed: file.parsed }, collection, matchedSource)!

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
      const { collection } = getCollectionByFilePath(withoutRoot(path), collections)
      if (!collection) {
        console.warn(`Content Preview: collection not found for file: ${path}, skipping deletion.`)
        return
      }

      const stem = generateStemFromPath(path)

      const query = generateRecordDeletion(collection, stem)

      const db = loadDatabaseAdapter(collection.name)

      await db.exec(query)
    }
  })

  async function sendNavigateMessage() {
    if (!dbReady.value) {
      return
    }

    const routePath = route.path

    const { collection } = getCollectionByRoutePath(routePath, collections)
    if (!collection || collection.type !== 'page') {
      window.sendNavigateMessageInPreview(routePath, false)
      return
    }

    const db = loadDatabaseAdapter(collection.name)

    const query = generateRecordSelectByColumn(collection, 'path', routePath)

    const file = await db.first(query) as { path: string }

    window.sendNavigateMessageInPreview(routePath, !!file?.path)
  }

  nuxtApp.hook('page:finish', () => {
    sendNavigateMessage()
  })

  // @ts-expect-error custom hook
  nuxtApp.hook('nuxt-content:preview:ready', () => {
    window.parent.postMessage({ type: 'nuxt-content:preview:ready' }, '*')
  })

  // Inject utils to window
  window.sendNavigateMessageInPreview = (path: string, navigate: boolean) => {
    window.parent.postMessage({
      type: 'nuxt-content:preview:navigate',
      payload: { path, navigate },
    }, '*')
  }
}

async function rerenderPreview() {
  await useNuxtApp().hooks.callHookParallel('app:data:refresh')
}
