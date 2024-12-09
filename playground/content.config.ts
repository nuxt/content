import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const content = defineCollection({
  type: 'page',
  source: {
    include: '**',
    exclude: [
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

const collections = {
  content,
  data,
  pages,
  contentV2: defineCollection({
    type: 'page',
    source: {
      repository: 'https://github.com/nuxt/content',
      include: 'docs/content/**',
      prefix: '/content-v2',
      exclude: [
        '**/_dir.yml',
      ],
    },
  }),
  nuxt: defineCollection({
    type: 'page',
    source: {
      repository: 'https://github.com/nuxt/nuxt',
      include: 'docs/**',
      prefix: '/nuxt',
      exclude: [
        '**/_dir.yml',
      ],
    },
  }),
  vue: defineCollection({
    type: 'page',
    source: {
      repository: 'https://github.com/vuejs/docs',
      include: 'src/**/*.md',
      prefix: '/vue',
    },
  }),
}

export default defineContentConfig({ collections })
