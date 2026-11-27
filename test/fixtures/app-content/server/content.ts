import { createNuxtContent } from '@nuxt/content/server'
import fs from 'comark-content/sources/fs'

export const content = createNuxtContent({
  mode: 'hybrid',
  sources: {
    docs: fs('content/docs', { cwd: import.meta.rootDir, prefix: '/docs' }),
    blog: fs('content/blog', { cwd: import.meta.rootDir, prefix: '/blog' }),
  },
})
