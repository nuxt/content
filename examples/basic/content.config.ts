import { defineContentConfig, defineCollection } from '@ripka/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**',
    }),
  },
})
