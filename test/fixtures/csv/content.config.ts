import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    people: defineCollection({
      type: 'data',
      source: 'org/people.csv',
      schema: z.object({
        name: z.string(),
        email: z.string().email(),
        role: z.string(),
      }),
    }),
  },
})
