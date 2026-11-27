import { createError, defineEventHandler, getRouterParam } from 'nuxt/server'
import { comarkContent } from 'comark-content'
import fs from 'comark-content/sources/fs'

// Serve the snapshot of `docs` at another commit, as an app route such as `/api/content/blob/<sha>` does.
const commits: Record<string, ReturnType<typeof comarkContent>> = {
  b: comarkContent('docs', { source: fs('commits/b', { cwd: import.meta.rootDir, prefix: '/docs' }) }),
}

export default defineEventHandler((event) => {
  const commit = commits[getRouterParam(event, 'commit')!]
  if (!commit || getRouterParam(event, 'file') !== 'docs.json') throw createError({ statusCode: 404 })
  return commit.snapshot()
})
