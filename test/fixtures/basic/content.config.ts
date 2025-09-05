import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**',
      schema: z.object({
        booleanField: z.boolean(),
        arrayField: z.array(z.string()),
        numberField: z.number(),
      }),
    }),
  },
})
