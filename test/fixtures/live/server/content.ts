import { createNuxtContent, lastCommit } from '@nuxt/content/server'
import forge from 'comark-content/sources/forge'
import fs from 'comark-content/sources/fs'
import { fileDriver } from './cache'
import { head, provider } from './forge'

const site = { provider, repo: 'acme/site', ref: 'main', path: 'content' }
const docs = { provider, repo: 'acme/docs', ref: 'main', path: 'docs' }
const docsSource = forge({ ...docs, prefix: '/docs', schema: { type: 'object', properties: { title: { type: 'string' }, badge: { type: 'string' } } } })
const cache = process.env.LIVE_CACHE_DIR ? { driver: fileDriver(process.env.LIVE_CACHE_DIR) } : undefined

// One per build of the fixture, picked with `LIVE_FORM`.
const forms = {
  // One function per source, in two repositories.
  sources: () => createNuxtContent({
    mode: 'server-only',
    sources: { site: forge(site), docs: docsSource },
    cache,
    live: {
      ref: {
        site: head('acme/site'),
        docs: lastCommit({ ...docs, path: process.env.LIVE_LAST_COMMIT_PATH || docs.path }),
      },
      maxAge: Number(process.env.LIVE_MAX_AGE || 3600),
    },
  }),
  // One source, no cache driver, no `maxAge`.
  source: () => createNuxtContent({
    mode: 'server-only',
    source: docsSource,
    live: { ref: lastCommit(docs) },
  }),
  // One function for two sources of one repository.
  shared: () => createNuxtContent({
    mode: 'server-only',
    sources: { docs_en: docsSource, docs_fr: forge({ ...docs, path: 'fr', prefix: '/fr' }) },
    cache,
    live: { ref: head('acme/docs'), maxAge: 3600 },
  }),
  // Rejected at setup.
  unpinnable: () => createNuxtContent({
    mode: 'server-only',
    sources: { site: fs('content', { cwd: import.meta.rootDir }), docs: docsSource },
    live: { ref: head('acme/docs') },
  }),
  missing: () => createNuxtContent({
    mode: 'server-only',
    sources: { site: forge(site), docs: docsSource },
    live: { ref: { docs: lastCommit(docs) } },
  }),
}

export const content = forms[(process.env.LIVE_FORM || 'sources') as keyof typeof forms]()
