import type { LayoutKey } from '#build/types/layouts'

export const ContentFileExtension = {
  Markdown: 'md',
  Yaml: 'yaml',
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

export interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

export interface Toc {
  title: string
  depth: number
  searchDepth: number
  links: TocLink[]
}

export interface MarkdownNode {
  type: string
  tag?: string
  value?: string
  props?: Record<string, unknown>
  content?: unknown
  children?: MarkdownNode[]

  attributes?: Record<string, unknown>
  fmAttributes?: Record<string, unknown>
}

export interface MarkdownRoot {
  type: 'root'
  children: MarkdownNode[]
  props?: Record<string, unknown>
  toc?: Toc
}

export interface ParsedContentInternalMeta {
  /**
   * Content id
   */
  _id?: string
  /**
   * Content source
   */
  _source?: string
  /**
   * Content path, this path is source agnostic and it the content my live in any source
   */
  path?: string
  /**
   * Content title
   */
  title?: string
  /**
   * Content draft status
   */
  _draft?: boolean
  /**
   * Content partial status
   */
  _partial?: boolean
  /**
   * Content locale
   */
  _locale?: string
  /**
   * File type of the content, i.e `markdown`
   */
  _type?: typeof ContentFileType[keyof typeof ContentFileType]
  /**
   * Path to the file relative to the content directory
   */
  _file?: string
  /**
   * Extension of the file
   */
  _extension?: typeof ContentFileExtension[keyof typeof ContentFileExtension]
}

export interface ParsedContentMeta extends ParsedContentInternalMeta {
  /**
   * Layout
   */
  layout?: LayoutKey

  [key: string]: unknown
}

export interface ParsedContent extends ParsedContentMeta {
  /**
   * Excerpt
   */
  excerpt?: MarkdownRoot
  /**
   * Content body
   */
  body: MarkdownRoot | null
}
