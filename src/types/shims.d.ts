import type { CollectionInfo } from './collection'
import type { DatabaseAdapter } from './database'

declare module '#content/manifest' {
  const manifest: Record<string, unknown>
  const checksums: Record<string, string>
  const tables: Record<string, string>

  export { manifest as default, checksums, tables }
}

declare module '#content/components' {
  export const globalComponents: string[]
  export const localComponents: string[]
}

declare module '#content/dump' {
  export const dump: string
}

declare module '#content/adapter' {
  const adapter: DatabaseAdapter

  export { adapter as default }
}

declare module '#content/collections' {
  export const collections: Record<string, unknown>
}

declare module '#content/studio' {
  export const collections: Record<string, CollectionInfo>
  export const gitInfo: GitInfo
  export const appConfigSchema: Record<string, unknown>
}
