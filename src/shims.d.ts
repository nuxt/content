import type { DatabaseAdapter } from './types/database'

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
