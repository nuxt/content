import { defineCollection, z } from '@nuxt/content'

export const collections = {
  blog: defineCollection({
    type: 'page',
    source: 'blog/**',
    schema: z.object({
      date: z.string(),
    }),
  }),
}
