import { createNuxtContent } from '@nuxt/content/content'
import fs from 'comark-content/sources/fs'

export const content = createNuxtContent({
  mode: 'hybrid',
  name: 'content',
  source: fs('content', { cwd: import.meta.rootDir }),
})
