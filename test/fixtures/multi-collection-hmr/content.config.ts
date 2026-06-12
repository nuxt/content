import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // Catch-all collection — every content file belongs to this one
    content: defineCollection({
      type: 'page',
      source: '**',
    }),
    // Narrower collection that overlaps with `content` for blog posts
    blog: defineCollection({
      type: 'page',
      source: 'blog/**',
    }),
  },
})
