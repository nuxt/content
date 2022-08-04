import type { CompatibilityEvent } from 'h3'
import type { ParsedContent, QueryBuilder } from '../types'
import { isPreview } from './preview'
import { cacheStorage, getContent, getContentsList, serverQueryContent } from './storage'

export async function getContentIndex (event: CompatibilityEvent) {
  let contentIndex = await cacheStorage.getItem('content-index.json') as Record<string, string>
  if (!contentIndex) {
    // Fetch all content
    const data = await serverQueryContent(event).find()

    contentIndex = data.reduce((acc, item) => {
      if (!acc[item._path!]) {
        acc[item._path!] = item._id
      } else if (item._id.startsWith('content:')) {
        acc[item._path!] = item._id
      }
      return acc
    }, {} as Record<string, string>)

    await cacheStorage.setItem('content-index.json', contentIndex)
  }

  return contentIndex
}

export async function getIndexedContentsList<T = ParsedContent> (event: CompatibilityEvent, query: QueryBuilder<T>): Promise<T[]> {
  const params = query.params()
  const path = params?.where?.find(wh => wh._path)?._path

  // Read from Index is not preview and path is string or RegExp
  if (!isPreview(event) && (typeof path === 'string' || path instanceof RegExp)) {
    const index = await getContentIndex(event)
    const keys = Object.keys(index)
      .filter(key => (path as any).test ? (path as any).test(key) : key === String(path))
      .map(key => index[key])

    const contents = await Promise.all(keys.map(key => getContent(event, key)))
    return contents as unknown as Promise<T[]>
  }

  return getContentsList(event) as unknown as Promise<T[]>
}
