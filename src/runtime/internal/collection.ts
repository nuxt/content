import type { CollectionInfo } from '@nuxt/content'
import contentManifest from '#content/manifest'

export function parseJsonFields<T>(sql: string, doc: T) {
  const jsonFields = findJsonFields(sql)
  const item = { ...doc } as T
  for (const key of (jsonFields as Array<keyof T>)) {
    if (item[key] && item[key] !== 'undefined') {
      item[key] = JSON.parse(item[key] as string)
    }
  }

  for (const key in item) {
    if (item[key] === 'NULL') {
      item[key as keyof T] = undefined as unknown as T[keyof T]
    }
  }
  return item
}

function findJsonFields(sql: string): string[] {
  const table = sql.match(/FROM\s+(\w+)/)
  if (!table) {
    return []
  }

  const info = contentManifest[getCollectionName(table[1]) as keyof typeof contentManifest] as CollectionInfo
  return info?.jsonFields || []
}

function getCollectionName(table: string) {
  return table.replace(/^_content_/, '')
}
