import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const Link = z.object({
  label: z.string(),
  to: z.string(),
  icon: z.string().optional(),
})

export default defineContentConfig({
  collections: {
    // String source pointing at a single file.
    index: defineCollection({
      type: 'data',
      source: 'index.yml',
      schema: z.object({
        title: z.string(),
      }),
    }),
    // String glob source.
    blog: defineCollection({
      type: 'page',
      source: 'blog/*',
      schema: z.object({
        date: z.string().date(),
        links: z.array(Link),
        image: z.string().editor({ input: 'media' }).optional(),
      }),
    }),
    // Object source with a prefix and an exclude.
    docs: defineCollection({
      type: 'page',
      source: {
        include: 'docs/**/*',
        exclude: ['docs/**/*.json'],
        prefix: '/docs',
      },
    }),
    // Remote GitHub source.
    remote: defineCollection({
      type: 'page',
      source: {
        repository: 'https://github.com/nuxt/nuxt/tree/3.x',
        include: 'docs/**/*',
        exclude: ['docs/**/*.json'],
        prefix: '/remote',
      },
    }),
    // Multiple sources on a single collection, sharing a prefix.
    landing: defineCollection({
      type: 'page',
      source: [
        { include: 'index.md', prefix: '/landing' },
        { include: 'blog.yml', prefix: '/landing' },
      ],
      schema: z.object({
        title: z.string(),
      }),
    }),
    // Nested glob with a filename extension in the tail.
    agencies: defineCollection({
      type: 'page',
      source: 'enterprise/agencies/*.md',
      schema: z.object({
        title: z.string(),
      }),
    }),
    // Object source with an explicit (relative) `cwd`.
    custom: defineCollection({
      type: 'page',
      source: {
        cwd: './content/docs',
        include: '*',
      },
    }),
    // Data collection without a schema — no defaults are injected.
    raw: defineCollection({
      type: 'data',
      source: 'index.yml',
    }),
    // Collection without a source is skipped.
    empty: defineCollection({
      type: 'data',
    }),
  },
})
