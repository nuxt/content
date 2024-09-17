import { z } from 'zod'
import { defineCollection, contentSchema } from '@farnabaz/content-next'

export const collections = [
  defineCollection('content', {
    source: {
      driver: 'fs',
      base: '~~/content',
      ignore: [
        '**/content/data/**',
        '**/content/pages/**',
      ],
    },
    schema: contentSchema,
  }),
  defineCollection('data', {
    source: '~~/content/data',
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
    source: '~~/content/pages',
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
