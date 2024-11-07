import { defineCollection, z } from '@nuxt/content'

export const collections = {
  docs: defineCollection({
    type: 'page',
    source: {
      path: 'docs/**',
      prefix: '/docs',
    },
    schema: z.object({
      links: z.array(z.object({
        label: z.string(),
        icon: z.string(),
        avatar: z.object({
          src: z.string(),
          alt: z.string(),
        }).optional(),
        to: z.string(),
        target: z.string().optional(),
      })).optional(),
    }),
  }),
}
