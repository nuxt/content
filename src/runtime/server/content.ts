import { prefixStorage } from 'unstorage'
import micromatch from 'micromatch'
import { getTransformer } from '../transformers'
import { createDatabase } from '../database'
import { generateNavigation } from '../navigation'
import { useDocusContext } from '../context'
// @ts-ignore
import { storage } from '#storage'

export const assetsStorage = prefixStorage(storage, 'assets')
export const previewStorage = prefixStorage(storage, 'preview')

// Remove prefix from key
const removePrefix = (key: string) => key.split(':').slice(1).join(':')

// Get data from storage
async function getData(id: string, previewKey?: string) {
  let body = null
  let meta = null
  // Use updated data if it exists
  if (previewKey) {
    body = await previewStorage.getItem(`${previewKey}:${id}`)
    meta = await previewStorage.getMeta(`${previewKey}:${id}`)
  }
  // Use original data
  if (!body) {
    body = await assetsStorage.getItem(id)
    meta = await assetsStorage.getMeta(id)
  }

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

async function getKeys(id?: string, previewKey?: string) {
  let keys: string[] = await assetsStorage.getKeys(id)
  // Remove assets prefix
  keys = keys.map(removePrefix)

  // Merge preview keys with original keys
  if (previewKey) {
    const prefix = `${previewKey}:`
    const previewKeys = (await previewStorage.getKeys(previewKey))
      // Remove preview prefix
      .map((key: string) => removePrefix(key.replace(prefix, '')))

    // Remove updated keys from original keys
    keys = keys.filter(key => !previewKeys.includes(key))
    keys.push(...previewKeys)
  }

  // filter out ignored contents
  const context = useDocusContext()
  // @ts-ignore
  keys = micromatch.not(keys, context.ignoreList)

  return keys
}

// Get content
export async function getContent(id: string, previewKey?: string) {
  const data = await getData(id, previewKey)
  if (typeof data.body === 'undefined' || data.body === null) {
    throw new Error(`Content not found: ${id}`)
  }
  const transformResult = await getTransformer(id)(id, data.body as any)
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
export const getNavigation = async (previewKey?: string) => {
  const list = await getList(undefined, previewKey)
  return generateNavigation(list)
}
