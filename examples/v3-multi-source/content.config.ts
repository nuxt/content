/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - v3 config: evaluated through the `readContentConfigSources` shim, not the real `@nuxt/content` exports.
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // Remote source: the documentation of https://content.nuxt.com,
    // read straight from the nuxt/content GitHub repository.
    docs: defineCollection({
      type: 'page',
      source: {
        repository: 'https://github.com/nuxt/content/tree/main/docs/content',
        include: 'docs/**',
        exclude: ['docs/**/*.json'],
        prefix: '/docs',
      },
    }),
    // Local source: markdown files in `content/blog`.
    blog: defineCollection({
      type: 'page',
      source: {
        include: 'blog/**',
        prefix: '/blog',
      },
      schema: z.object({
        date: z.string().date(),
        author: z.string().optional(),
      }),
    }),
  },
})
