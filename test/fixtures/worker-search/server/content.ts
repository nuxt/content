import { createNuxtContent } from '@nuxt/content/content'
import fs from 'comark-content/sources/fs'

export const content = createNuxtContent({
  mode: 'server-only',
  sources: {
    docs: fs('content/docs', { cwd: import.meta.rootDir, prefix: '/docs' }),
    blog: fs('content/blog', { cwd: import.meta.rootDir, prefix: '/blog' }),
  },
})
