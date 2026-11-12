import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // A glob inside a locale folder, like Docus' `docs_<locale>` collections.
    docs_en: defineCollection({
      type: 'page',
      source: { include: 'en/**', exclude: ['en/index.md'], prefix: '/en' },
    }),
    // A prefix that differs from the folder.
    docs_foo: defineCollection({
      type: 'page',
      source: { include: 'en/**', exclude: ['en/index.md'], prefix: '/foo' },
    }),
    // The root prefix, like Docus' non-i18n `docs` collection.
    docs_root: defineCollection({
      type: 'page',
      source: { include: 'docs/**', prefix: '/' },
    }),
    // A single file inside a folder.
    landing_en: defineCollection({
      type: 'page',
      source: { include: 'en/index.md' },
    }),
    // Several sources, each with its own prefix.
    multi: defineCollection({
      type: 'page',
      source: [
        { include: 'en/**', exclude: ['en/index.md'], prefix: '/multi/en' },
        { include: 'fr/**', prefix: '/multi/fr' },
      ],
    }),
  },
})
