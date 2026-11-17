import type { CollectionI18nConfig, CollectionType, ResolvedCollection } from './collection'

export interface Manifest {
  checksumStructure: Record<string, string>
  checksum: Record<string, string>
  dump: Record<string, string[]>
  components: string[]
  collections: ResolvedCollection[]
}

export interface ManifestCollectionMeta {
  type: CollectionType
  fields: Record<string, 'string' | 'number' | 'boolean' | 'date' | 'json'>
  i18n?: CollectionI18nConfig
}

export type ManifestCollectionsMeta = Record<string, ManifestCollectionMeta>
