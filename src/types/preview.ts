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

/*
 `draft:sync` socket data
*/
export interface DraftSyncData {
  files: DraftSyncFile[]
  additions: DraftFile[]
  deletions: DraftFile[]
}

export interface DraftSyncFile {
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

/*
Iframe messaging data
*/
export type FileStatus = 'created' | 'updated' | 'deleted' | 'renamed'

export interface PreviewFile {
  id: number
  name: string
  nameWithoutPrefix: string
  type: 'file'
  path: string
  pathPreview: string
  pathWithoutRoot: string
  pathRoute: string
  status: FileStatus
  content: string
  updatedAt: string
  parsed: ParsedContentv2
}

export interface FileChangeMessagePayload {
  additions: PreviewFile[]
  deletions: { path: string }[]
}

export interface FileSelectMessagePayload {
  path: string
}

export type FileMessageType = 'nuxt-content:editor:file-selected' | 'nuxt-content:editor:file-changed' | 'nuxt-content:editor:media-changed' | 'nuxt-content:config:file-changed'

export interface FileMessageData {
  type: FileMessageType
  payload: FileChangeMessagePayload | FileSelectMessagePayload
  navigate: boolean // Navigate to the updated file
}
