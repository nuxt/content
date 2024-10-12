import { defineCollection } from '@nuxt/content'

export const collections = {
  docs: defineCollection({
    type: 'page',
    source: '**',
  }),
}
