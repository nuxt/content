import { fileURLToPath } from 'node:url'

const moduleEntry = fileURLToPath(new URL('../../src/module.ts', import.meta.url))

/**
 * The official examples ship the old Content v3 surface: a `content.config.ts`
 * of `defineContentConfig`/`defineCollection` collections, plus `queryCollection`
 * and `<ContentRenderer>`. Booting each one against this module is the regression
 * check that those configs still resolve and render.
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
