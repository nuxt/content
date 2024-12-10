import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: 'docs/**',
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
    landing: defineCollection({
      type: 'page',
      source: [{
        include: 'index.md',
      }, {
        include: 'studio.md',
      }, {
        include: 'blog.yml',
      }, {
        include: 'changelog.yml',
      }, {
        include: 'templates.yml',
      }],
    }),
  },
})
