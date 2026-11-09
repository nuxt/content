import type { ContentListFile, ContentRegistry, NavigationItem, SourceData } from 'comark-content'
import type { FullFile } from './runtime/v3/query'
import type { HighlightOptions } from './utils/highlight'
import type { AnchorLinksOptions } from './utils/anchor-links'
import type { TocOptions } from './utils/toc'

export type { HighlightOptions, TocOptions }

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
  /**
   * Content v3 compatibility layer: the `queryCollection*` composables and the deprecated
   * `<ContentRenderer>` and `<MDC>` components. Set to `false` for a pure v4 app.
   * @default true
   */
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
      /**
       * Table of contents generated for each document, exposed as `body.toc`.
       * @see https://content.nuxt.com/docs/getting-started/configuration#toc
       */
      toc?: TocOptions
    }
  }
  /**
   * Nuxt Content v3 renderer options, kept for backward compatibility.
   */
  renderer?: {
    /**
     * Heading levels that link to themselves (`<h2 id="setup"><a href="#setup">`).
     * With Nuxt UI, its `Prose*` heading components add the links, as in v3.
     * @default { h2: true, h3: true, h4: true }
     * @see https://content.nuxt.com/docs/getting-started/configuration#anchorlinks
     */
    anchorLinks?: AnchorLinksOptions
  }
}

// #endregion
