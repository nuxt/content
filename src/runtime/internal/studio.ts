import { createApp } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'
import type { AppConfig } from 'nuxt/schema'
import type { TransformedContent } from '@nuxt/content'
import micromatch from 'micromatch'
import StudioPreviewMode from '../components/StudioPreviewMode.vue'
import type { FileChangeMessagePayload, PreviewFile, PreviewResponse } from '../../types/studio'
import { createSingleton, deepAssign, deepDelete, defu, mergeDraft, StudioConfigFiles } from '../../utils/studio'
import { loadDatabaseAdapter } from '../internal/database.client'
import { callWithNuxt, refreshNuxtData } from '#app'
import { useAppConfig, useNuxtApp, useRuntimeConfig, ref, toRaw, useRoute, useRouter } from '#imports'
import { collections } from '#content/studio'

// const dbFiles: PreviewFile[] = []

// const { storage, findContentItem, updateContentItem, removeContentItem, removeAllContentItems, setPreviewMetaItems } = useContentStorage()

const initialAppConfig = createSingleton(() => JSON.parse(JSON.stringify((useAppConfig()))))

const syncPreview = async (data: PreviewResponse) => {
  const mergedFiles = mergeDraft(data.files, data.additions, data.deletions)

  // // Handle content files
  const contentFiles = mergedFiles.filter(item => !([StudioConfigFiles.appConfig, StudioConfigFiles.appConfigV4, StudioConfigFiles.nuxtConfig].includes(item.path)))
  await syncPreviewFiles(contentFiles)

  // const appConfig = mergedFiles.find(item => [StudioConfigFiles.appConfig, StudioConfigFiles.appConfigV4].includes(item.path))
  // syncPreviewAppConfig(appConfig?.parsed)

  // requestRerender()

  // return true
}

const fileCollection = (file: PreviewFile) => {
  return Object.values(collections).find((collection) => {
    if (!collection.source) {
      return
    }

    return micromatch.isMatch(file.path, collection.source.path, { ignore: collection.source.ignore || [], dot: true })
  })

  // if (collection) {
  //   await loadDatabaseAdapter(collection.name)
  // }
}

const syncPreviewFiles = async (files: PreviewFile[]) => {
  const insertV2Content = async (file: PreviewFile) => {
    // const internalKeys = ['_id', 'stem', 'meta', 'extension']
    const mappedFile = {
      _id: file.parsed._id,
      stem: file.parsed._stem,
      meta: {},
      extension: file.parsed._extension,
      path: file.parsed._path,
    }

    const collection = fileCollection(file)
    const properties = collection.schema.definitions[collection.name].properties

    Object.keys(file.parsed).forEach((key) => {
      if (key in properties) {
        mappedFile[key] = file.parsed[key]
      }
      else {
        mappedFile.meta[key] = file.parsed[key]
      }
    })

    const query = generateCollectionInsert(collection, mappedFile)

    // Load db
    const db = loadDatabaseAdapter(collection.name)

    // Define table
    await db.exec(collection.tableDefinition)

    // Insert preview files
    await db.exec(query)

    // window.db = db
  }

  await insertV2Content(files[0])

  refreshNuxtData()

  // TODO Remove previous preview data
  // removeAllContentItems(previewToken)

  // TODO Set preview meta
  // setPreviewMetaItems(previewToken, files)

  // TODO Handle content files
  // await Promise.all(
  //   files.map((file) => {
  //     updateContentItem(previewToken, file)
  //   }),
  // )
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
    syncPreview,
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

  window.addEventListener('message', async (e) => {
    // IFRAME_MESSAGING_ALLOWED_ORIGINS format must be a comma separated string of allowed origins
    const allowedOrigins = studio?.iframeMessagingAllowedOrigins?.split(',').map((origin: string) => origin.trim()) || []
    if (!['https://nuxt.studio', 'https://new.nuxt.studio', 'https://new.dev.nuxt.studio', 'https://dev.nuxt.studio', 'http://localhost:3000', ...allowedOrigins].includes(e.origin)) {
      return
    }

    const { type, payload = {} } = e.data || {}

    switch (type) {
      case 'nuxt-studio:editor:file-selected': {
        // TODO
        const content: TransformedContent = null
        // const content = await findContentItem(payload.path)
        if (!content || content._partial) {
          // Do not navigate to another page if content is not found
          // This makes sure that user stays on the same page when navigation through directories in the editor
          // Also, We should not navigate if content is a partial
          return
        }

        // Ensure that the content is related to a valid route for non markdown files
        if (!String(payload.path).endsWith('.md')) {
          const resolvedRoute = router.resolve(content.path)
          if (!resolvedRoute || !resolvedRoute.matched || resolvedRoute.matched.length === 0) {
            return
          }
        }

        // Navigate to the selected content
        if (content.path !== useRoute().path) {
          editorSelectedPath.value = content._path!
          router.push(content._path!)
        }
        break
      }
      case 'nuxt-studio:editor:media-changed':
      case 'nuxt-studio:editor:file-changed': {
        const previewToken = window.sessionStorage.getItem('previewToken') as string
        const { additions = [], deletions = [] } = payload as FileChangeMessagePayload
        for (const addition of additions) {
          // TODO
          // await updateContentItem(previewToken, addition)
        }
        for (const deletion of deletions) {
          // TODO
          // await removeContentItem(previewToken, deletion.path)
        }
        requestRerender()
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
  })

  nuxtApp.hook('page:finish', () => {
    detectRenderedContents()

    if (nuxtApp.payload.prerenderedAt) {
      requestRerender()
    }
  })

  // TODO check with ahad
  // // @ts-expect-error custom hook
  // nuxtApp.hook('content:document-driven:finish', ({ route, page }) => {
  //   route.meta.studio_page_contentId = page?._id
  // })

  // @ts-expect-error custom hook
  // nuxtApp.hook('nuxt-studio:preview:ready', () => {
  //   window.parent.postMessage({
  //     type: 'nuxt-studio:preview:ready',
  //     payload: routePayload(useRoute()),
  //   }, '*')

  //   setTimeout(() => {
  //     // Initial sync
  //     detectRenderedContents()
  //   }, 100)
  // })

  // Inject Utils to window
  function detectRenderedContents() {
    const renderedContents = Array.from(window.document.querySelectorAll('[data-content-id]'))
      .map(el => el.getAttribute('data-content-id')!)

    console.log('Detect rendered contents :', renderedContents)

    const contentIds = Array
      .from(new Set([route.meta.studio_page_contentId as string, ...renderedContents]))
      .filter(Boolean)

    if (editorSelectedPath.value === contentIds[0]) {
      editorSelectedPath.value = ''
      return
    }

    window.openFileInStudio(contentIds, { navigate: true, pageContentId: route.meta.studio_page_contentId as string })
  }

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

async function requestRerender() {
  // TODO discuss with Ahad
  // if (contentConfig?.documentDriven) {
  //   const { pages } = callWithNuxt(nuxtApp, useContentState)

  //   const contents = await Promise.all(Object.keys(pages.value).map(async (key) => {
  //     return await findContentItem(pages.value[key]?._id ?? key)
  //   }))

  //   pages.value = contents.reduce((acc, item, index) => {
  //     if (item) {
  //       acc[Object.keys(pages.value)[index]] = item
  //     }
  //     return acc
  //   }, {} as Record<string, ParsedContent>)
  // }
  // Directly call `app:data:refresh` hook to refresh all data (!Calling `refreshNuxtData` causing some delay in data refresh!)
  await nuxtApp.hooks.callHookParallel('app:data:refresh')
}

// Convert collection data to SQL insert statement
export function generateCollectionInsert(collection: any, data: Record<string, unknown>) {
  const fields: string[] = []
  const values: Array<string | number | boolean> = []
  const properties = collection.schema.definitions[collection.name].properties
  const sortedKeys = Object.keys(properties).sort()

  sortedKeys.forEach((key) => {
    const value = (properties)[key]
    // const underlyingType = getUnderlyingType(value as ZodType<unknown, ZodOptionalDef>)
    const underlyingType = value.type

    const defaultValue = value.default ? value.default : 'NULL'
    const valueToInsert = typeof data[key] !== 'undefined' ? data[key] : defaultValue

    fields.push(key)
    if ((collection.jsonFields || []).includes(key)) {
      values.push(`'${JSON.stringify(valueToInsert).replace(/'/g, '\'\'')}'`)
    }
    else if (['string', 'enum'].includes(underlyingType)) {
      values.push(`'${String(valueToInsert).replace(/\n/g, '\\n').replace(/'/g, '\'\'')}'`)
    }
    // else if (['Date'].includes(underlyingType)) {
    //   values.push(valueToInsert !== 'NULL' ? `'${new Date(valueToInsert as string).toISOString()}'` : defaultValue)
    // }
    // else if (underlyingType.constructor.name === 'ZodBoolean') {
    //   values.push(valueToInsert !== 'NULL' ? !!valueToInsert : valueToInsert)
    // }
    else {
      values.push(valueToInsert)
    }
  })

  let index = 0

  return `INSERT INTO ${collection.tableName} VALUES (${'?, '.repeat(values.length).slice(0, -2)})`
    .replace(/\?/g, () => values[index++] as string)
}
