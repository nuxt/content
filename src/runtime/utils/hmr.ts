import type { ContentFile } from 'comark-content'

/** Vite HMR events the module sends when a watched content file changes in development. */
export const HMR_UPDATE_EVENT = 'nuxt-content:update'
export const HMR_REMOVE_EVENT = 'nuxt-content:remove'

export interface ContentHmrUpdate {
  source: string
  /** Full content key, `<source>/<path-in-source>`. */
  key: string
  file: ContentFile
}

export interface ContentHmrRemove {
  source: string
  key: string
}
