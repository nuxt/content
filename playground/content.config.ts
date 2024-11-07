import { defineCollection, z } from '@nuxt/content'

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
    rawbody: z.string(),
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
  vue: defineCollection({
    type: 'page',
    source: {
      repository: 'https://github.com/vuejs/docs',
      path: 'src/**/*.md',
      prefix: '/vue',
    },
  }),
}
