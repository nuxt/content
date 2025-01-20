import type { Primitive, Connector } from 'db0'

export type CacheEntry = { id: string, checksum: string, parsedContent: string }

export type DatabaseBindParams = Primitive[]

export type DatabaseBindable = number | string | boolean | null | undefined

export interface DatabaseAdapter {
  first<T>(sql: string, params?: DatabaseBindParams): Promise<T | null | undefined>
  all<T>(sql: string, params?: DatabaseBindParams): Promise<T[]>
  exec(sql: string): Promise<unknown>
}

export type DatabaseAdapterFactory<Options> = (otps?: Options) => DatabaseAdapter

export interface LocalDevelopmentDatabase {
  fetchDevelopmentCache(): Promise<Record<string, CacheEntry>>
  fetchDevelopmentCacheForKey(key: string): Promise<CacheEntry | undefined>
  insertDevelopmentCache(id: string, checksum: string, parsedContent: string): void
  deleteDevelopmentCache(id: string): void
  dropContentTables(): void
  exec(sql: string): void
  close(): void
  database?: Connector
}
