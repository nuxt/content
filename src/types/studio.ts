import type { TransformedContent } from './content'

export interface PreviewFile {
  path: string
  parsed?: TransformedContent
}

export interface DraftFile {
  path: string
  parsed?: TransformedContent
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
