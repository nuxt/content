import { prefixStorage } from 'unstorage'
import micromatch from 'micromatch'
import { getTransformer } from '../transformers'
import { createDatabase } from '../database'
import { generateNavigation } from '../navigation'
import { useDocusContext } from '../context'
import { cachify } from './utils/cache'
// @ts-ignore
import { storage } from '#storage'

export const assetsStorage = prefixStorage(storage, 'assets')
export const previewStorage = prefixStorage(storage, 'preview')

const isProduction = process.env.NODE_ENV === 'production'
const withCache = (name: string, fn: any, force = false) =>
  isProduction || force ? cachify(fn, { name, swr: true, ttl: 60000, integrity: 'docus' }) : fn

// Remove prefix from key
const removePrefix = (key: string) => key.split(':').slice(1).join(':')

const getContentData = withCache('getContentData', async (id: string) => {
  let body = await assetsStorage.getItem(id)
  const meta = await assetsStorage.getMeta(id)

  /**
   * Unstorage tries to parse content as JSON
   * The following logic will ensure that the content is always a string
   */
  // Stringify objects
  if (typeof body === 'object') {
    body = JSON.stringify(typeof (body as any).default !== 'undefined' ? (body as any).default : body)
  }
  // Ensure body is a string
  if (typeof body !== 'string') {
    body = body + ''
  }
  return {
    body,
    meta
  }
})

async function getPreviewData(id: string, previewKey: string) {
  let body = await previewStorage.getItem(`${previewKey}:${id}`)
  const meta = await previewStorage.getMeta(`${previewKey}:${id}`)

  /**
   * Unstorage tries to parse content as JSON
   * The following logic will ensure that the content is always a string
   */
  // Stringify objects
  if (typeof body === 'object') {
    body = JSON.stringify(typeof (body as any).default !== 'undefined' ? (body as any).default : body)
  }
  // Ensure body is a string
  if (typeof body !== 'string') {
    body = body + ''
  }
  return {
    body,
    meta
  }
}

// Get data from storage
function getData(id: string, previewKey?: string) {
  // Use updated data if it exists
  if (previewKey) {
    return getPreviewData(id, previewKey)
  }

  return getContentData(id)
}

const getContentKeys = withCache('getContentKeys', async (id?: string) => {
  let keys: string[] = await assetsStorage.getKeys(id)
  // Remove assets prefix
  keys = keys.map(removePrefix)

  // filter out ignored contents
  const context = useDocusContext()
  keys = micromatch.not(keys, context?.ignoreList || [])

  return keys
})

const getPreviewKeys = async (id?: string, previewKey?: string) => {
  let keys = (await previewStorage.getKeys(id ? `${previewKey}:${id}` : previewKey)).map((key: string) =>
    removePrefix(key.replace(`${previewKey}:`, ''))
  )

  // filter out ignored contents
  const context = useDocusContext()
  keys = micromatch.not(keys, context?.ignoreList || [])

  return keys
}

async function getKeys(id?: string, previewKey?: string) {
  let keys: string[] = await getContentKeys(id)

  // Merge preview keys with original keys
  if (previewKey) {
    const previewKeys = await getPreviewKeys(id, previewKey)

    // Remove updated keys from original keys
    keys = keys.filter(key => !previewKeys.includes(key))
    keys.push(...previewKeys)
  }

  return keys
}

// Get content
const transform = withCache('transform', (id: string, body: string) => getTransformer(id)(id, body), true)
export async function getContent(id: string, previewKey?: string) {
  const data = await getData(id, previewKey)
  if (typeof data.body === 'undefined' || data.body === null) {
    throw new Error(`Content not found: ${id}`)
  }
  const transformResult = await transform(id, data.body as any)
  return {
    meta: {
      ...data.meta,
      ...transformResult.meta
    },
    body: transformResult.body
  }
}

// Get list of content
export async function getList(id?: string, previewKey?: string) {
  const keys: string[] = await getKeys(id, previewKey)
  return Promise.all(
    keys.map(async key => {
      const content = await getContent(key, previewKey)
      return {
        id: key,
        ...content.meta
      }
    })
  )
}

// Get content
export async function searchContent(to: string, body: any, previewKey?: string) {
  const navigation = await getNavigation(previewKey)

  const db = await createDatabase(navigation)

  return db.search(to, body)
}

// Get navigation from cache
const getNavigationFromCache = withCache('navigation', generateNavigation)
export const getNavigation = async (previewKey?: string) => {
  const list = await getList(undefined, previewKey)
  return previewKey ? generateNavigation(list) : getNavigationFromCache(list)
}
