import type { H3Event } from 'h3'
import type { ParsedContent , ContentQueryBuilder } from '@nuxt/content'
import { isPreview } from './preview'
import { cacheStorage, chunksFromArray, getContent, getContentsList } from './storage'
import { useRuntimeConfig } from '#imports'

export async function getContentIndex (event: H3Event) {
  const defaultLocale = useRuntimeConfig().content.defaultLocale
  let contentIndex = await cacheStorage().getItem('content-index.json') as Record<string, string[]>
  if (!contentIndex) {
    // Fetch all contents
    const data = await getContentsList(event)

    contentIndex = data.reduce((acc: Record<string, string[]>, item: ParsedContent) => {
      acc[item._path!] = acc[item._path!] || []
      if (item._locale === defaultLocale) {
        acc[item._path!]!.unshift(item._id)
      } else {
        acc[item._path!]!.push(item._id)
      }
      return acc
    }, {} as Record<string, string[]>)

    await cacheStorage().setItem('content-index.json', contentIndex)
  }

  return contentIndex
}

export async function getIndexedContentsList<T = ParsedContent> (event: H3Event, query: ContentQueryBuilder<T>): Promise<T[]> {
  const params = query.params()
  const path = params?.where?.find(wh => wh._path)?._path

  // Read from Index is not preview and path is string or RegExp
  if (!isPreview(event) && !params.surround && !params.dirConfig && (typeof path === 'string' || path instanceof RegExp)) {
    const index = await getContentIndex(event)
    const keys = Object.keys(index)
      .filter(key => (path as any).test ? (path as any).test(key) : key === String(path))
      .flatMap(key => index[key] as string[])

    const keyChunks = [...chunksFromArray(keys, 10)]

    const contents = []
    for await (const chunk of keyChunks) {
      const result = await Promise.all(chunk.map(key => getContent(event, key)))
      contents.push(...result)
    }

    return contents as unknown as Promise<T[]>
  }

  return getContentsList(event) as unknown as Promise<T[]>
}
