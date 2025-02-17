import type { SQLOperator } from '@nuxt/content'

export interface LLMSOptions {
  domain: string
  sections: Array<{
    title: string
    collection: string
    description?: string
    filters?: Array<{
      field: string
      operator: SQLOperator
      value?: string
    }>
  }>
  title?: string
  description?: string
  notes?: string[]
}
