import type { ResolvedCollection } from './collection'

export interface Manifest {
  checksumStructure: Record<string, string>
  checksum: Record<string, string>
  dump: Record<string, string[]>
  components: string[]
  collections: ResolvedCollection[]
}
