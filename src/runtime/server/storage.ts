import { prefixStorage } from 'unstorage'
import { isDevelopment } from 'std-env'
import { hash as ohash } from 'ohash'
import type { QueryBuilderParams, ParsedContent } from '../types'
import { createQuery } from '../query/query'
import { createPipelineFetcher } from '../query/match/pipeline'
import { parse, transform } from './transformer'
import { privateConfig } from '#config'
import { storage } from '#storage'

export const contentStorage = prefixStorage(storage, 'content:source')
export const cacheStorage = prefixStorage(storage, 'cache:content')

/**
 * Content ignore patterns
 */
export const contentIgnores = privateConfig.content.ignores.map((p: any) =>
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
  const contents = await Promise.all(keys.map(key => getContent(key)))

  return contents
}

export const getContent = async (id: string): Promise<ParsedContent> => {
  // Handled ingored id
  if (!contentIgnorePredicate(id)) {
    return { id, body: null }
  }
  if (isDevelopment) {
    const hash = ohash(await contentStorage.getMeta(id))
    const cached: any = await cacheStorage.getItem(`parsed:${id}`)
    if (cached?.hash === hash) {
      return cached.parsed as ParsedContent
    }
  }

  const body = await contentStorage.getItem(id)

  if (body === null) {
    return { id, body: null }
  }

  const meta = await contentStorage.getMeta(id)
  const parsedContent = await parse(id, body as string).then(transform)
  const parsed = {
    ...meta,
    ...parsedContent
  }

  if (isDevelopment) {
    const hash = ohash(meta)
    await cacheStorage.setItem(`parsed:${id}`, { parsed, hash })
  }

  return parsed
}

/**
 * Query contents
 */
export const queryContent = (
  body?: string | Partial<QueryBuilderParams>,
  params?: Partial<QueryBuilderParams>
) => {
  if (typeof body === 'string') {
    body = {
      slug: body,
      ...params
    }
  }

  const pipelineFetcher = createPipelineFetcher(getContentsList)

  return createQuery(pipelineFetcher, body)
}
