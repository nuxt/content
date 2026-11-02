import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('content components', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/components', import.meta.url)),
  })

  const findLink = (html: string, label: string) => {
    const match = html.match(new RegExp(`<a\\b[^>]*>${label}</a>`))
    expect(match, `link "${label}" is rendered`).toBeTruthy()
    return match![0]
  }

  describe('links render through `NuxtLink` (registered as `A`)', () => {
    it('marks a link to the current route as active', async () => {
      const link = findLink(await $fetch<string>('/'), 'Home link')
      expect(link).toContain('href="/"')
      // Added by NuxtLink (vue-router `RouterLink`); a plain `<a>` has neither.
      expect(link).toContain('aria-current="page"')
      expect(link).toContain('router-link-exact-active')
    })

    it('renders internal links as router links', async () => {
      const link = findLink(await $fetch<string>('/'), 'Internal link')
      expect(link).toContain('href="/about"')
      expect(link).not.toContain('aria-current')
      expect(link).not.toContain('rel=')
    })

    it('adds `rel="nofollow"` to external links, as in v3', async () => {
      const link = findLink(await $fetch<string>('/'), 'External link')
      expect(link).toContain('href="https://nuxt.com"')
      expect(link).toContain('rel="nofollow"')
    })
  })

  it('renders a bundled component from `components/content`', async () => {
    expect(await $fetch<string>('/')).toContain('<div class="bundled-component">')
  })

  it('renders a lazy component from `components/content/*.lazy.vue`', async () => {
    expect(await $fetch<string>('/')).toContain('<div class="chunked-component">')
  })

  it('renders a global component', async () => {
    expect(await $fetch<string>('/')).toContain('<div class="instanced-component">')
  })

  // `components/TestUnused.vue` imports a missing file: the build only succeeds when
  // components no document uses are left out.
  it('renders a project component used by a document', async () => {
    expect(await $fetch<string>('/')).toContain('<div class="project-component">')
  })
})
