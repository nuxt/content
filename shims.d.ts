import { DocusContent } from 'types'

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
    $content: DocusContent<T>
  }
}
