import type { CollectionInfo } from '@nuxt/content'
import contentManifest, { tables } from '#content/manifest'

export function refineContentFields<T>(sql: string, doc: T) {
  const fields = findCollectionFields(sql)
  const item = { ...doc } as T
  for (const key in item) {
    if (fields[key as string] === 'json' && item[key] && item[key] !== 'undefined') {
      item[key] = JSON.parse(item[key] as string)
    }
    if (fields[key as string] === 'boolean' && item[key] !== 'undefined') {
      item[key] = Boolean(item[key]) as never
    }
  }

  for (const key in item) {
    if (item[key] === 'NULL') {
      item[key as keyof T] = undefined as unknown as T[keyof T]
    }
  }
  return item
}

function findCollectionFields(sql: string): Record<string, 'string' | 'number' | 'boolean' | 'date' | 'json'> {
  const table = sql.match(/FROM\s+(\w+)/)
  if (!table) {
    return {}
  }

  const collection = getCollectionName(table[1]!)
  if (!collection) {
    return {}
  }

  const info = contentManifest[collection as keyof typeof contentManifest] as CollectionInfo
  return info?.fields || {}
}

function getCollectionName(table: string) {
  return Object.keys(tables).find(name => tables[name] === table)
}
