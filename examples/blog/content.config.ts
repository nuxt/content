import { defineCollection, defineContentConfig, z } from '@ripka/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**',
      schema: z.object({
        date: z.string(),
      }),
    }),
  },
})
