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
async function getData(id: string, withPreview?: boolean) {
  let body = null
  let meta = null
  // Use updated data if it exists
  if (withPreview) {
    body = await previewStorage.getItem(id)
    meta = await previewStorage.getMeta(id)
  }
  // Use original data
  if (!body) {
    body = await assetsStorage.getItem(id)
    meta = await assetsStorage.getMeta(id)
  }

  return {
    body,
    meta
  }
}

async function getKeys(id?: string, withPreview?: boolean) {
  let keys: string[] = await assetsStorage.getKeys(id)
  // Remove assets prefix
  keys = keys.map(removePrefix)

  // Merge preview keys with original keys
  if (withPreview) {
    const previewKeys = (await previewStorage.getKeys()).map(removePrefix)
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
export async function getContent(id: string, withPreview?: boolean) {
  const data = await getData(id, withPreview)
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
export async function getList(id?: string, withPreview?: boolean) {
  const keys: string[] = await getKeys(id, withPreview)
  return Promise.all(
    keys.map(async key => {
      const content = await getContent(key, withPreview)
      return {
        id: key,
        ...content.meta
      }
    })
  )
}

// Get content
export async function searchContent(to: string, body: any, withPreview?: boolean) {
  const navigation = await getNavigation(withPreview)

  const db = await createDatabase(navigation)

  return db.search(to, body)
}

// Get navigation from cache
export const getNavigation = async (withPreview?: boolean) => {
  const list = await getList(undefined, withPreview)
  return generateNavigation(list)
}
