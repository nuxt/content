import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: 'docs/**',
    }),
    authors: defineCollection({
      type: 'data',
      source: 'authors/*.yml',
      schema: z.object({ name: z.string() }),
    }),
    sponsors: defineCollection({
      type: 'data',
      source: 'sponsors/*.json',
      schema: z.object({ name: z.string() }),
    }),
  },
})
