import { fileURLToPath } from 'node:url'
import type { Page } from 'playwright-core'

const moduleEntry = fileURLToPath(new URL('../../src/module.ts', import.meta.url))

/**
 * The official examples ship the old Content v3 surface: a `content.config.ts`
 * of `defineContentConfig`/`defineCollection` collections, plus `queryCollection`
 * and `<ContentRenderer>` (now a deprecated alias of `<ContentDocument>`).
 * Booting each one against this module is the regression check that those
 * configs still resolve and render.
 *
 * They declare `modules: ['@nuxt/content']`, while this package is published as
 * `@nuxt/content4`, so the alias points that name at the module under test.
 * Each example lives in its own file: `@nuxt/test-utils` keeps a single context,
 * so more than one `setup()` per file would clobber the server URL.
 */
export function example(name: string) {
  return {
    rootDir: fileURLToPath(new URL(`../../examples/${name}`, import.meta.url)),
    nuxtConfig: {
      alias: { '@nuxt/content': moduleEntry },
    },
  }
}

// Static artifacts prerendered for hybrid mode. Anything else under
// `/__nuxt_content` is the server API answering a query.
const SNAPSHOT_ARTIFACT = /^\/__nuxt_content\/(?:manifest\.json|(?:manifest|snapshot)\/[^/]+\.json)$/

/**
 * Collect the requests a page sends to the content server API (snapshot and
 * manifest downloads excluded) and to route payloads. In hybrid mode a client
 * navigation must answer its queries in the browser, so this stays empty.
 */
export function trackServerContentRequests(page: Page) {
  const requests: string[] = []
  page.on('request', (request) => {
    const { pathname } = new URL(request.url())
    if ((pathname.startsWith('/__nuxt_content/') && !SNAPSHOT_ARTIFACT.test(pathname)) || pathname.endsWith('/_payload.json')) {
      requests.push(pathname)
    }
  })
  return requests
}
