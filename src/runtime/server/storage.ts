import { prefixStorage } from 'unstorage'
import { isDevelopment } from 'std-env'
import { hash as ohash } from 'ohash'
import type { QueryBuilderParams, ParsedContentMeta, ParsedContent } from '../types'
import { createQuery } from '../query/query'
import { createPipelineFetcher } from '../query/match/pipeline'
import { parse, transform } from './transformer'
import { privateConfig } from '#config'
import { storage } from '#storage'
// @ts-ignore
import { plugins } from '#query-plugins'

export const contentStorage = prefixStorage(storage, 'content:source')

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
  const contents = await Promise.all(keys.map(key => getContent(key).then(c => c.meta)))

  return contents
}

export const getContent = async (id: string): Promise<ParsedContent> => {
  // Handled ingored id
  if (!contentIgnorePredicate(id)) {
    return { meta: { id }, body: null }
  }
  if (isDevelopment) {
    const hash = ohash(await contentStorage.getMeta(id))
    const cached: any = await storage.getItem(`cache:${id}`)
    if (cached?.hash === hash) {
      return cached.parsed as ParsedContent
    }
  }

  const body = await contentStorage.getItem(id)

  if (body === null) {
    return { meta: { id }, body: null }
  }

  const meta = await contentStorage.getMeta(id)

  let parsedContent = await parse(id, body as string)

  parsedContent = await transform(parsedContent)

  const parsed = {
    meta: {
      ...meta,
      ...parsedContent.meta
    },
    body: parsedContent.body
  }

  if (isDevelopment) {
    const hash = ohash(meta)
    await storage.setItem(`cache:${id}`, { parsed, hash })
  }

  return parsed
}

/**
 * Query contents
 */
export const useContentQuery = (
  body?: string | Partial<QueryBuilderParams>,
  params?: Partial<QueryBuilderParams>
) => {
  if (typeof body === 'string') {
    body = {
      slug: body,
      ...params
    }
  }

  const pipelineFetcher = createPipelineFetcher(getContentsList, plugins)

  return createQuery<ParsedContentMeta>(pipelineFetcher, body, plugins)
}
