import type { Collections, CollectionInfo } from '@nuxt/content'
import { collections as _collections } from '#content/collections'

export const collectionsInfo = _collections as Record<keyof Collections, CollectionInfo>

export function getCollectionInfo(collection: string): CollectionInfo | undefined {
  return collectionsInfo[collection as keyof Collections]
}

export async function loadDatabaseDump(): Promise<string> {
  // @ts-expect-error - Vite doesn't know about the import
  const dump: string = await import('#content/dump' /* @vite-ignore */).then(m => m.default)

  return dump
}
