/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - v3 config: evaluated through the `readContentConfigSources` shim, not the real `@nuxt/content` exports.
import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
    }),
  },
})
