import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'data',
      source: 'docs/**.json',
      schema: z.object({
        title: z.string(),
        body: z.string(),
      }),
    }),
  },
})
