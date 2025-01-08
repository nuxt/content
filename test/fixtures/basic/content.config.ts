import { defineCollection, defineContentConfig, z } from '@nuxt/content'

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
