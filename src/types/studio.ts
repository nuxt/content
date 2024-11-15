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

// {
//   "id": 0,
//   "name": "2.installation.md",
//   "nameWithoutPrefix": "installation.md",
//   "type": "file",
//   "path": "content/docs/1.getting-started/2.installation.md",
//   "pathPreview": "content/docs/1.getting-started/2.installation.md",
//   "pathWithoutRoot": "docs/1.getting-started/2.installation.md",
//   "pathRoute": "docs/getting-started/installation",
//   "status": "updated",
//   "content": "---\ntitle: Installation\ndescription: Get started with Nuxt Content v3 in your Nuxt application.\n---\n\n###\n",
//   "updatedAt": "2024-11-12T10:30:55.626Z",
//   "parsed": ''
// }

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
  deletions: PreviewFile[]
}

export interface FileSelectMessagePayload {
  path: string
}

export const enum FileMessageType {
  FileSelected = 'nuxt-studio:editor:file-selected',
  FileChanged = 'nuxt-studio:editor:file-changed',
  MediaChanged = 'nuxt-studio:editor:media-changed',
  ConfigFileChanged = 'nuxt-studio:config:file-changed',
}

export interface FileMessageData {
  type: FileMessageType
  payload: FileChangeMessagePayload | FileSelectMessagePayload
  navigate: boolean // Navigate to the updated file
}
