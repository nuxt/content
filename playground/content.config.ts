import { z } from 'zod'
import { defineCollection } from '@farnabaz/content-next'

export const collections = [
  defineCollection('data', {
    type: 'data',
    source: {
      name: 'data',
      driver: 'fs',
      base: '~~/content/data',
    },
    schema: z.object({
      path: z.string(),
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
  }),
  defineCollection('pages', {
    type: 'page',
    source: {
      name: 'pages',
      driver: 'fs',
      base: '~~/content/pages',
    },
    schema: z.object({
      authors: z.array(
        z.object({
          name: z.string(),
          email: z.string(),
        }),
      ),
    }),
  }),
]
