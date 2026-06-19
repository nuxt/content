import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**',
      schema: z.object({
        featured: z.string().optional(),
        gallery: z.array(z.string()).optional(),
      }),
    }),
  },
})
