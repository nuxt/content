import { QueryBuilder } from './Database'

declare namespace NodeJS {
  interface Process {
    dev: boolean
    client: boolean
    server: boolean
    options: any
    previewUrl: string
  }
}

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
