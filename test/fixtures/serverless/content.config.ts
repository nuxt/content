import { cpSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineContentConfig, defineCollection } from '@nuxt/content'
import { sourceDir } from './source-dir'

cpSync(fileURLToPath(new URL('./content', import.meta.url)), sourceDir, { recursive: true })

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: {
        cwd: sourceDir,
        include: '**',
      },
    }),
  },
})
