import { defineCollection, z } from '@farnabaz/content-next'

const content = defineCollection({
  type: 'page',
  source: {
    path: '**',
    ignore: [
      'data/**',
      'pages/**',
    ],
  },
  schema: z.object({
    date: z.date(),
  }),
})

const data = defineCollection({
  type: 'page',
  source: 'data/**',
  schema: z.object({
    path: z.string(),
    to: z.string(),
    company: z.string(),
    domain: z.array(z.string()),
    tutorial: z.array(
      z.record(
        z.object({
          name: z.string(),
          type: z.string(),
          born: z.number(),
        }),
      ),
    ),
    author: z.string(),
    published: z.boolean(),
  }),
})

const pages = defineCollection({
  type: 'page',
  source: 'pages/**',
})

export const collections = {
  content,
  data,
  pages,
  contentV2: defineCollection({
    type: 'page',
    source: {
      repository: 'https://github.com/nuxt/content',
      path: 'docs/content/**',
      prefix: '/content-v2',
      ignore: [
        '**/_dir.yml',
      ],
    },
  }),
  nuxt: defineCollection({
    type: 'page',
    source: {
      repository: 'https://github.com/nuxt/nuxt',
      path: 'docs/**',
      prefix: '/nuxt',
      ignore: [
        '**/_dir.yml',
      ],
    },
  }),
  foo: defineCollection({
    source: 'data/foo/bar.yml',
    type: 'data',
    schema: z.object({
      name: z.string(),
      type: z.string(),
      born: z.number(),
    }),
  }),
}
