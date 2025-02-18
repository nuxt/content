import type { SQLOperator } from '@nuxt/content'

export interface ContentLLMSCollectionSection {
  title: string
  collection: string
  description?: string
  filters?: Array<{
    field: string
    operator: SQLOperator
    value?: string
  }>
}

export interface ContentLLMSLinksSection {
  title: string
  description?: string
  links: Array<{
    title: string
    description?: string
    href: string
  }>
}

export interface LLMSOptions {
  /**
   * Domain of the documentation
   */
  domain: string
  /**
   * Enable the full documentation
   */
  llmsFull?: {
    title: string
    description: string
  }
  sections: Array<ContentLLMSCollectionSection | ContentLLMSLinksSection>
  title?: string
  description?: string
  notes?: string[]
}
