import type { MDCOptions } from '@docus/mdc'

export interface DocusContext {
  locales: {
    codes: string[]
    defaultLocale: string
  }
  database: {
    provider: string
    options: any
  }
  search: {
    inheritanceFields: string[]
    fields: string[]
  }
  transformers: {
    markdown: Partial<MDCOptions>
  }
}
