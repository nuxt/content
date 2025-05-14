import type { ZodObject, ZodRawShape } from 'zod'
import type { Draft07 } from '../types/schema'
import type { MarkdownRoot } from './content'

export interface PageCollections {}
export interface Collections {}

export type CollectionType = 'page' | 'data'

export type CollectionSource = {
  include: string
  prefix?: string
  exclude?: string[]
  repository?: string
  authToken?: string
  authBasic?: {
    username: string
    password: string
  }
  cwd?: string
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

export interface PageCollection<T extends ZodRawShape = ZodRawShape> {
  type: 'page'
  source?: string | CollectionSource | CollectionSource[] | ResolvedCustomCollectionSource
  schema?: ZodObject<T>
}

export interface DataCollection<T extends ZodRawShape = ZodRawShape> {
  type: 'data'
  source?: string | CollectionSource | CollectionSource[] | ResolvedCustomCollectionSource
  schema: ZodObject<T>
}

export type Collection<T extends ZodRawShape = ZodRawShape> = PageCollection<T> | DataCollection<T>

export interface DefinedCollection {
  type: CollectionType
  source: ResolvedCollectionSource[] | undefined
  schema: Draft07
  extendedSchema: Draft07
  fields: Record<string, 'string' | 'number' | 'boolean' | 'date' | 'json'>
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
