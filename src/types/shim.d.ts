import { QueryBuilder } from './Database'

type SearchOptions = { deep?: boolean; text?: boolean }

declare module '@nuxt/types' {
  interface Context {
    $content: {
      search: (to?: string | SearchOptions, options?: SearchOptions) => QueryBuilder
      fetch: <T>(path: string, opts?: any) => Promise<T>
      get: <T>(id: string) => Promise<T>
      preview: (previewKey?: string) => Context['$content']
    }
  }
}
