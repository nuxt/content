import { getExtension } from './paths'

export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'avif', 'bmp', 'cur', 'apng', 'tiff', 'tif', 'heic', 'heif', 'jxl']

// Content extensions (md, mdc, json, yml, yaml, csv) are excluded on purpose:
// in v3 those can be legitimate `data` collection content.
export const DEFAULT_ASSET_EXTENSIONS = [
  ...IMAGE_EXTENSIONS,
  // video
  'mp4', 'mov', 'webm', 'ogv', 'avi', 'flv', 'mkv', 'm4v', 'mpg', 'mpeg', '3gp',
  // audio
  'mp3', 'm4a', 'wav', 'ogg', 'oga', 'weba', 'opus', 'flac', 'aac', 'mid', 'midi',
  // subtitles / tracks
  'vtt', 'srt',
  // embeddable documents and pages
  'html', 'htm', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'rtf',
  // archives
  'zip', 'tar', 'gz', 'tgz', 'bz2', 'rar', '7z',
  // fonts
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  // other web assets
  'glb', 'gltf', 'wasm',
]

export function isImage(path: string): boolean {
  return IMAGE_EXTENSIONS.includes(getExtension(path))
}

export type ImageSizeHint = 'style' | 'attrs' | 'src' | 'url'

export function matchImageSizeHints(value: string | string[] | false | undefined): ImageSizeHint[] {
  if (!value) {
    return []
  }
  const list = Array.isArray(value) ? value : [value]
  const tokens = list.flatMap(item => (typeof item === 'string' ? item.match(/[^\s,|]+/g) || [] : []))
  return [...new Set(tokens)] as ImageSizeHint[]
}

export interface ContentReference {
  id: string
  /** Absolute source path, used to re-parse the file on HMR. */
  path: string
  collection: string
}

export interface AssetIndexEntry {
  /** Public URL the relative reference is rewritten to, e.g. `/media/photo.png`. */
  publicSrc: string
  width?: number
  height?: number
  /** Content files referencing this asset (reverse index, used by dev HMR). */
  content: ContentReference[]
}

// Both indexes are keyed by the absolute source path with ordering stripped.
export type AssetIndex = Map<string, AssetIndexEntry>

// References to a not-yet-existing asset, so dev HMR can re-parse once it appears.
export type UnresolvedIndex = Map<string, ContentReference[]>
