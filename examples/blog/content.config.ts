import { defineCollection, z } from '@farnabaz/content-next'

const posts = defineCollection({
  type: 'page',
  source: 'blog/**',
  schema: z.object({
    image: z.string().optional(),
    date: z.string(),
  }),
})

export const collections = {
  posts,
}
