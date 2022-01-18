import { prefixStorage } from 'unstorage'
import { createQuery } from '../query'
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

export const getContentsIds = async (prefix?: string) => {
  const keys = await contentStorage.getKeys(prefix)

  return keys.filter(contentIgnorePredicate)
}

export const getContentsList = async (prefix?: string) => {
  const keys = await getContentsIds(prefix)

  const contents = await Promise.all(keys.map(key => getContent(key).then(c => c.meta)))

  return contents
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

export const searchContents = async (query: Partial<QueryBuilderParams>) => {
  const $query = createQuery(await getContentsList(), query)

  return $query.fetch()
}
