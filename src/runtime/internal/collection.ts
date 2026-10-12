import type { CollectionInfo } from '@nuxt/content'
import contentManifest from '#content/manifest'

/**
 * Refine raw fields from D1/SQLite query results into their proper JS types.
 * Handles JSON parsing, boolean coercion (preserving null for absent fields),
 * and removes empty JSON objects that arise from D1 column defaults.
 */
export function refineContentFields<T>(sql: string, doc: T) {
  const fields = findCollectionFields(sql)
  const item = { ...doc } as T
  for (const key in item) {
    if (fields[key as string] === 'json' && item[key] && item[key] !== 'undefined') {
      const parsed = JSON.parse(item[key] as string)
      if (key !== 'meta' && parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length === 0) {
        Reflect.deleteProperty(item as object, key)
      }
      else {
        item[key] = parsed
      }
    }
    if (fields[key as string] === 'boolean' && item[key] !== 'undefined') {
      if (item[key] == null) {
        Reflect.deleteProperty(item as object, key)
      }
      else {
        item[key] = Boolean(item[key]) as never
      }
    }
  }

  for (const key in item) {
    if (item[key] === 'NULL') {
      item[key as keyof T] = undefined as unknown as T[keyof T]
    }
  }
  return item
}

/** Extract the field type map for the collection referenced in the SQL query. */
function findCollectionFields(sql: string): Record<string, 'string' | 'number' | 'boolean' | 'date' | 'json'> {
  const table = sql.match(/FROM\s+(\w+)/)
  if (!table) {
    return {}
  }

  const info = contentManifest[getCollectionName(table[1]!) as keyof typeof contentManifest] as CollectionInfo
  return info?.fields || {}
}

/** Strip the `_content_` prefix from a D1 table name to get the collection name. */
function getCollectionName(table: string) {
  return table.replace(/^_content_/, '')
}
