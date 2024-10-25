import type { ResolvedCollection } from './collection'

export interface Manifest {
  checksum: Record<string, string>
  dump: Record<string, string[]>
  components: string[]
  collections: ResolvedCollection[]
}
