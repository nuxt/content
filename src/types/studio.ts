export interface ParsedContentv2 {
  _id: string
  _source?: string
  _path?: string
  title?: string
  _draft?: boolean
  _partial?: boolean
  _locale?: string
  _type?: 'markdown' | 'yaml' | 'json' | 'csv'
  _file?: string
  _extension?: 'md' | 'yaml' | 'yml' | 'json' | 'json5' | 'csv'
  excerpt?: Record<string, unknown>
  body: Record<string, unknown> | null
  layout?: string
  [key: string]: unknown
}

export interface PreviewFile {
  path: string
  parsed?: ParsedContentv2
}

export interface DraftFile {
  path: string
  parsed?: ParsedContentv2
  new?: boolean
  oldPath?: string
  pathMeta?: Record<string, unknown>
}

export interface PreviewResponse {
  files: PreviewFile[]
  additions: DraftFile[]
  deletions: DraftFile[]
}

export interface FileChangeMessagePayload {
  additions: Array<PreviewFile>
  deletions: Array<PreviewFile>
}
