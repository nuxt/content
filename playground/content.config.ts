import { defineContentConfig, defineCollectionSource, defineCollection, property } from '@nuxt/content'
import { z } from 'zod'

const hackernews = defineCollection({
  type: 'data',
  source: defineCollectionSource({
    getKeys: async () => {
      const keys = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json').then(res => res.json())
      return keys.map((key: string) => `${key}.json`)
    },
    getItem: async (key: string) => {
      const id = key.split('.')[0]
      return await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
    },
  }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    type: z.string(),
    score: z.number(),
    url: z.string(),
    by: z.string(),
  }),
})

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
    testd: property(z.object({})).inherit('components/TestD.vue'),
  }),
})

const data = defineCollection({
  type: 'data',
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
  people: defineCollection({
    type: 'data',
    source: 'org/people.csv',
    schema: z.object({
      name: z.string(),
      email: z.string().email(),
    }),
  }),
  org: defineCollection({
    type: 'data',
    source: 'org/**.csv',
    schema: z.object({
      body: z.array(z.any()),
    }),
  }),
  hackernews,
  content,
  data,
  pages,
  buttons: defineCollection({
    type: 'data',
    source: 'testd/**',
    schema: property(z.object({})).inherit('@nuxt/ui/components/Button.vue'),
  }),
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
      repository: 'https://github.com/nuxt/nuxt/tree/main',
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
