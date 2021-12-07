import { prefixStorage as unstoragePrefixStorage } from 'unstorage'
import type { Storage } from 'unstorage'
import minimatch from 'minimatch'
import { getTransformer } from '../transformers'
import { createDatabase } from '../database'
import { generateNavigation } from '../navigation'
import { cachify } from './utils/cache'
import privateConfig from '#config'
import { storage } from '#storage'
import type { MDCRoot } from 'types'

interface DocusContent {
  body: MDCRoot
  meta: Record<string, any>
}

// TODO: Fix in upstream
function prefixStorage(storage: Storage, base: string): Storage {
  const nsStorage = unstoragePrefixStorage(storage, base)
  const prefixRegex = new RegExp(`^${base}:`)
  nsStorage.getKeys = (id: string = '') => {
    return storage.getKeys(base + ':' + id).then(keys => keys.map(key => key.replace(prefixRegex, '')))
  }
  return nsStorage
}

export const contentStorage = prefixStorage(storage, 'docus:source')
export const buildStorage = prefixStorage(storage, 'assets:docus:build')
export const previewStorage = prefixStorage(storage, 'docus:preview')

const isProduction = process.env.NODE_ENV === 'production'
const withCache = (name: string, fn: any) =>
  isProduction ? cachify(fn, { name, swr: true, ttl: 60000, integrity: 'docus' }) : fn

/**
 * Content ignore filter
 *
 * @param key file name
 * @returns true if file does not match any of patterns
 */
const filterIgnoredContents = (key: string) =>
  !(privateConfig.docus.ignoreList || []).some((pattern: string) => minimatch(key, pattern))

// Get data from storage
async function getData(id: string, previewKey?: string) {
  let body
  let meta
  // Use updated data if it exists
  if (previewKey) {
    body = await previewStorage.getItem(`${previewKey}:${id}`)
    meta = await previewStorage.getMeta(`${previewKey}:${id}`)
  }

  // Fallback to original data
  if (!body) {
    body = await contentStorage.getItem(id)
    meta = await contentStorage.getMeta(id)
  }

  /**
   * Unstorage tries to parse content as JSON
   * The following logic will ensure that the content is always a string
   */
  if (body && typeof body === 'object') {
    body = JSON.stringify(typeof (body as any).default !== 'undefined' ? (body as any).default : body)
  }

  // Ensure body is a string
  if (typeof body !== 'string') {
    body = body + ''
  }

  return {
    body: body as string,
    meta
  }
}

const getContentKeys = async (id?: string) => {
  let keys: string[] = await buildStorage.getKeys(id)

  if (keys.length === 0) {
    keys = await contentStorage.getKeys(id)

    // filter out ignored contents
    keys = keys.filter(filterIgnoredContents)
  }

  return keys
}

const getPreviewKeys = async (id?: string, previewKey?: string) => {
  let keys = (await previewStorage.getKeys(id ? `${previewKey}:${id}` : previewKey)).map((key: string) =>
    key.replace(`${previewKey}:`, '')
  )

  // filter out ignored contents
  keys = keys.filter(filterIgnoredContents)

  return keys
}

/**
 * Find list of content keys
 *
 * @param id Base if for lookup
 * @param previewKey Preview ID
 * @returns List of content keys in given base path
 */
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

/**
 * Read content form source file, generate and cache the content
 *
 * @param id Content ID
 * @param previewKey Preview id
 * @returns Transformed content
 */
export async function buildContent(id: string, previewKey?: string): Promise<DocusContent> {
  const data = await getData(id, previewKey)
  if (typeof data.body === 'undefined' || data.body === null) {
    throw new Error(`Content not found: ${id}`)
  }
  const transformResult = await getTransformer(id)(id, data.body)
  const content = {
    meta: {
      ...data.meta,
      ...transformResult.meta
    },
    body: transformResult.body
  }
  if (!previewKey) {
    await buildStorage.setItem(id, content)
  }
  return content
}

/**
 * Return transformed conntent if it exists in cache or build it on demand
 *
 * @param id Content ID
 * @param previewKey Preview ID
 * @returns Transformed content
 */
export async function getContent(id: string, previewKey?: string): Promise<DocusContent> {
  let content = !previewKey && ((await buildStorage.getItem(id)) as DocusContent)

  /**
   * Check modified time of content
   */
  if (!isProduction && content && content.meta.mtime !== (await contentStorage.getMeta(id)).mtime) {
    content = false
  }

  if (!content) {
    content = await buildContent(id, previewKey)
  }
  return content
}

/**
 * Find list of contents
 *
 * @param id Base if for lookup
 * @param previewKey Preview ID
 * @returns List of content in given base path
 */
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

/**
 * Search content database for a given query
 *
 * @param to Base path for search
 * @param body Search options
 * @param previewKey Preview ID
 * @returns Single content of list of contents that matchs the search
 */
export async function searchContent(to: string, body: any, previewKey?: string) {
  const navigation = await getNavigation(previewKey)

  const db = await createDatabase(navigation)

  return db.search(to, body)
}

// Get navigation from cache
const getNavigationCached = withCache('navigation', async () => generateNavigation(await getList()))
export const getNavigation = async (previewKey?: string) => {
  if (!previewKey) {
    return getNavigationCached()
  }
  return generateNavigation(await getList(undefined, previewKey))
}
