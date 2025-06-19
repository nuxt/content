import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    landing: defineCollection({
      type: 'page',
      source: {
        // @ts-expect-error __DOCS_DIR__ is not defined
        cwd: globalThis.__DOCS_DIR__,
        include: 'index.md',
      },
    }),
    docs: defineCollection({
      type: 'page',
      source: {
        include: 'docs/**/*',
      },
      schema: z.object({
        links: z.array(z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
          target: z.string().optional(),
        })).optional(),
      }),
    }),
  },
})
