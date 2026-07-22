import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    // Path-based i18n collection: content organized by locale directories
    blog: defineCollection({
      type: 'page',
      source: '*/blog/**',
      schema: z.object({
        date: z.string().optional(),
      }),
      i18n: {
        locales: ['en', 'fr'],
        defaultLocale: 'en',
      },
    }),
    // Inline i18n collection: translations embedded in the content file
    team: defineCollection({
      type: 'data',
      source: 'data/team.yml',
      schema: z.object({
        name: z.string(),
        role: z.string(),
        country: z.string().optional(),
      }),
      i18n: {
        locales: ['en', 'fr', 'de'],
        defaultLocale: 'en',
      },
    }),
    // `i18n: true` shorthand without @nuxtjs/i18n installed: the integration is
    // disabled with a warning and no `locale` column is added.
    notes: defineCollection({
      type: 'data',
      source: 'notes/*.yml',
      schema: z.object({
        text: z.string(),
      }),
      i18n: true,
    }),
  },
})
