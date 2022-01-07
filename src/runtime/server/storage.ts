import { prefixStorage } from 'unstorage'
import { parse, transform } from './transformer'
import { storage } from '#storage'
import { privateConfig } from '#config'

export const contentStorage = prefixStorage(storage, 'docus:source')

/**
 * Content ignore patterns
 */
export const contentIgnores = privateConfig.docus.ignores.map((p: any) =>
  typeof p === 'string' ? new RegExp(`^${p}`) : p
)

/**
 * Filter predicate for ignore patterns
 */
const contentIgnorePredicate = (key: string) =>
  !contentIgnores.some((prefix: RegExp) => key.split(':').some(k => prefix.test(k)))

export const getContentsList = async (prefix?: string) => {
  const keys = await contentStorage.getKeys(prefix)

  return keys.filter(contentIgnorePredicate)
}

export const getContent = async (key: string) => {
  // Handled ingored key
  if (!contentIgnorePredicate(key)) {
    return { meta: {}, body: null }
  }

  const body = await contentStorage.getItem(key)
  const meta = await contentStorage.getMeta(key)

  let parsedContent = await parse(key, body as string)

  parsedContent = await transform(parsedContent)

  return {
    meta: {
      ...meta,
      ...parsedContent.meta
    },
    body: parsedContent.body
  }
}
