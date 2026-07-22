import type { CollectionI18nConfig, CollectionType, ResolvedCollection } from './collection'

export interface Manifest {
  checksumStructure: Record<string, string>
  checksum: Record<string, string>
  dump: Record<string, string[]>
  components: string[]
  collections: ResolvedCollection[]
}

/**
 * Shape of a single collection entry in the generated `#content/manifest` default export.
 * Kept here so runtime code can import a typed view rather than casting.
 */
export interface ManifestCollectionMeta {
  type: CollectionType
  fields: Record<string, 'string' | 'number' | 'boolean' | 'date' | 'json'>
  i18n?: CollectionI18nConfig
  stemPrefix?: string
}

export type ManifestCollectionsMeta = Record<string, ManifestCollectionMeta>
