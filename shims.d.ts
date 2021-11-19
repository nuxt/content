import type { DocusContent } from 'types'

declare global {
  declare namespace NodeJS {
    interface Process {
      dev: boolean
      client: boolean
      server: boolean
      options: any
      previewUrl: string
    }
  }
  interface Window {
    onNuxtReady: any
    $docus: DocusRuntimeInstance
  }
}

declare module '@nuxt/types' {
  interface Context {
    $content: DocusContent<any>
  }
}
