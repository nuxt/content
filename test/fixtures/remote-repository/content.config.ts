import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: {
        repository: 'https://github.com/nuxt/content',
        include: 'docs/content/**',
        exclude: [
          '**/_dir.yml',
        ],
      },
    }),
  },
})
