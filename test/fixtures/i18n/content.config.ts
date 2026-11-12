import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
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
    pages: defineCollection({
      type: 'page',
      source: 'pages/**',
      i18n: {
        locales: ['en', 'fr'],
        defaultLocale: 'en',
      },
    }),
    settings: defineCollection({
      type: 'data',
      source: 'settings/*.json',
      schema: z.object({
        name: z.string(),
        links: z.array(z.object({ label: z.string(), to: z.string() })),
      }),
      i18n: {
        locales: ['en', 'fr'],
        defaultLocale: 'en',
      },
    }),
    // Without @nuxtjs/i18n installed, `i18n: true` disables i18n with a warning
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
