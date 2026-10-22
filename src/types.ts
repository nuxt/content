import type { ContentListFile, ContentRegistry, NavigationItem, SourceData } from 'comark-content'
import type { FullFile } from './runtime/v3/query'
import type { HighlightOptions } from './utils/highlight'

export type { HighlightOptions }

// #region v3 types

/** Nuxt Content v3 name of a navigation tree node returned by `queryCollectionNavigation()`. */
export type ContentNavigationItem = NavigationItem

/**
 * Full document type of every collection, keyed by collection name, as returned
 * by `queryCollection(name).first()`. Mirrors v3's `Collections` and is filled in
 * by the generated `ContentRegistry` augmentation (`.nuxt/content/types.d.ts`).
 */
export type Collections = {
  [K in keyof ContentRegistry]: FullFile<ContentListFile<SourceData<K>>>
}

/**
 * v3 restricted this to `type: 'page'` collections. The registry doesn't record
 * collection types, so every collection is included.
 */
export type PageCollections = Collections

// #endregion

// #region others

// Module options TypeScript interface definition
export interface ModuleOptions {
  mode?: 'server-only' | 'hybrid'
  watch?: boolean
  v3Composables?: boolean
  /**
   * Nuxt Content v3 build options, kept for backward compatibility.
   */
  build?: {
    markdown?: {
      /**
       * Highlight code blocks with Shiki. Requires `shiki` to be installed in your project.
       * @see https://content.nuxt.com/docs/getting-started/configuration#highlight
       */
      highlight?: HighlightOptions | boolean
    }
  }
}

// #endregion
