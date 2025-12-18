import type { Draft07 } from '../types/schema'
import type { MarkdownRoot } from './content'
import type { GitBasicAuth, GitRepositoryType } from './git'
import type { ContentStandardSchemaV1 } from './schema'

export interface PageCollections {}
export interface Collections {}

export type CollectionType = 'page' | 'data'

/**
 * Defines an index on collection columns for optimizing database queries
 */
export interface CollectionIndex {
  /**
   * Column names to include in the index
   */
  columns: string[]

  /**
   * Optional custom index name
   * If not provided, will auto-generate: idx_{collection}_{columns.join('_')}
   */
  name?: string

  /**
   * Whether this is a unique index
   * @default false
   */
  unique?: boolean
}

export type CollectionSource = {
  include: string
  prefix?: string
  exclude?: string[]
  repository?: string | GitRepositoryType
  cwd?: string
  /**
   * @deprecated Use `repository.auth` instead
   */
  authToken?: string
  /**
   * @deprecated Use `repository.auth` instead
   */
  authBasic?: GitBasicAuth
}

export interface ResolvedCollectionSource extends CollectionSource {
  _resolved: true
  prepare?: (opts: { rootDir: string }) => Promise<void>
  getKeys?: () => Promise<string[]>
  getItem?: (path: string) => Promise<string>
  cwd: string
}

export interface CustomCollectionSource {
  prepare?: (opts: { rootDir: string }) => Promise<void>
  getKeys: () => Promise<string[]>
  getItem: (path: string) => Promise<string>
}

export interface ResolvedCustomCollectionSource extends ResolvedCollectionSource {
  _custom: true
}

export interface PageCollection<T> {
  type: 'page'
  source?: string | CollectionSource | CollectionSource[] | ResolvedCustomCollectionSource
  schema?: ContentStandardSchemaV1<T>
  indexes?: CollectionIndex[]
}

export interface DataCollection<T> {
  type: 'data'
  source?: string | CollectionSource | CollectionSource[] | ResolvedCustomCollectionSource
  schema: ContentStandardSchemaV1<T>
  indexes?: CollectionIndex[]
}

export type Collection<T> = PageCollection<T> | DataCollection<T>

export interface DefinedCollection {
  type: CollectionType
  source: ResolvedCollectionSource[] | undefined
  schema: Draft07
  extendedSchema: Draft07
  fields: Record<string, 'string' | 'number' | 'boolean' | 'date' | 'json'>
  indexes?: CollectionIndex[]
}

export interface ResolvedCollection extends DefinedCollection {
  name: string
  tableName: string
  /**
   * Whether the collection is private or not.
   * Private collections will not be available in the runtime.
   */
  private: boolean
}

export interface CollectionInfo {
  name: string
  pascalName: string
  tableName: string
  source: ResolvedCollectionSource[]
  type: CollectionType
  schema: Draft07
  fields: Record<string, 'string' | 'number' | 'boolean' | 'date' | 'json'>
  tableDefinition: string
}

export interface CollectionItemBase {
  id: string
  stem: string
  extension: string
  meta: Record<string, unknown>
}

export interface PageCollectionItemBase extends CollectionItemBase {
  path: string
  title: string
  description: string
  seo: {
    title?: string
    description?: string

    [key: string]: unknown
  }
  body: MarkdownRoot
  navigation?: boolean | {
    title: string
    description: string
    icon: string
  }
}

export interface DataCollectionItemBase extends CollectionItemBase {}
