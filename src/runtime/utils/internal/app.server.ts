import type { Collections } from '@nuxt/content'
import type { CollectionInfo } from '../../../types'
import { collections as _collections } from '#content-v3/collections'

export const collectionsInfo = _collections as Record<keyof Collections, CollectionInfo>

export function getCollectionInfo(collection: string): CollectionInfo | undefined {
  return collectionsInfo[collection as keyof Collections]
}

export async function loadDatabaseDump(): Promise<string> {
  // @ts-expect-error - Vite doesn't know about the import
  const dump: string = await import('#content-v3/dump' /* @vite-ignore */).then(m => m.default)

  return dump
}
