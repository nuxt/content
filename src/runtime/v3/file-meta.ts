import { defineContentPlugin } from 'comark-content'
import type { CollectionSource } from './content-config'

/**
 * Rewrite `meta.stem` and `meta.extension` to v3's values when a file is parsed.
 *
 * - `stem`: v3 kept the collection prefix (`en/1.guide/2.page`), Comark measures it from the source folder.
 * - `extension`: v3 stored `md`, Comark stores `.md`.
 *
 * Also sets `meta.collectionType` to the collection's v3 `type`. Every collection is its own
 * instance, so this is what tells a `data` collection's Markdown apart from a page.
 *
 * `file:parsed` never runs on `update()` replays or snapshot hydration, so files are rewritten once.
 */
export default defineContentPlugin(() => ({
  name: 'v3-file-meta',
  setup(content) {
    content.hooks.hook('file:parsed', async ({ source, file }) => {
      if (!file) return
      const { stem, extension } = file.meta
      // A merged collection keeps the first child's prefix, so ask it which child serves the file.
      const prefixed = source as CollectionSource | undefined
      const prefix = (prefixed?.prefixOf ? await prefixed.prefixOf(stem + extension) : prefixed?.prefix) ?? ''
      // `prefix: '/'` (Docus' `docs` collection) adds nothing.
      file.meta.stem = [prefix.replace(/^\/+|\/+$/g, ''), stem].filter(Boolean).join('/')
      file.meta.extension = extension.replace(/^\./, '')
      // `stem` now holds the prefix, so drop `meta.prefix`: `generateNavigation` would cut it again from folder stems.
      delete file.meta.prefix
      if (prefixed?.collectionType) {
        file.meta.collectionType = prefixed.collectionType
      }
    })
  },
}))
