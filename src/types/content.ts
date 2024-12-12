import type { Highlighter, MDCRoot, Toc } from '@nuxtjs/mdc'

export type { Toc, TocLink } from '@nuxtjs/mdc'

export interface ContentFile extends Record<string, unknown> {
  id: string
  body: string
  path: string
  dirname?: string
  extension?: string
}

export interface TransformedContent {
  id: string
  [key: string]: unknown
}

export interface TransformContentOptions {
  transformers?: ContentTransformer[]
  [key: string]: unknown
}

export type ContentTransformer = {
  name: string
  extensions: string[]
  parse(file: ContentFile, options: Record<string, unknown>): Promise<TransformedContent> | TransformedContent
  transform?(content: TransformedContent, options: Record<string, unknown>): Promise<TransformedContent> | TransformedContent
} | {
  name: string
  extensions: string[]
  parse?(file: ContentFile, options: Record<string, unknown>): Promise<TransformedContent> | TransformedContent
  transform(content: TransformedContent, options: Record<string, unknown>): Promise<TransformedContent> | TransformedContent
}

export interface MarkdownPlugin extends Record<string, unknown> {
  instance?: unknown
  options?: Record<string, unknown>
}

export interface MarkdownOptions {
  /**
   * Enable/Disable MDC components.
   */
  mdc: boolean
  toc: {
    /**
     * Maximum heading depth to include in the table of contents.
     */
    depth: number
    searchDepth: number
  }
  tags: Record<string, string>
  remarkPlugins: Record<string, false | MarkdownPlugin>
  rehypePlugins: Record<string, false | MarkdownPlugin>

  highlight?: {
    highlighter?: Highlighter
    [key: string]: unknown
  }
}

export const ContentFileExtension = {
  Markdown: 'md',
  Yaml: 'yaml',
  Yml: 'yml',
  Json: 'json',
  Csv: 'csv',
  Xml: 'xml',
} as const

export const ContentFileType = {
  Markdown: 'markdown',
  Yaml: 'yaml',
  Json: 'json',
  Csv: 'csv',
} as const

export interface MarkdownRoot extends MDCRoot {
  props?: Record<string, unknown>
  toc?: Toc
}
