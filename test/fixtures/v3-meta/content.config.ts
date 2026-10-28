import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // `sitemap` and `modifiedAt` are not in the schema, so v3 kept them under `meta`.
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        category: z.string().optional(),
      }),
    }),
  },
})
