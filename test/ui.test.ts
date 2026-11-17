import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { uiFixture } from './fixtures/ui-fixture'

describe('nuxt ui', async () => {
  await setup(uiFixture())

  it('renders headings with Nuxt UI `Prose*` components', async () => {
    const html = await $fetch<string>('/')
    expect(html).toMatch(/<h1 id="nuxt-ui" class="[^"]*text-highlighted[^"]*">/)
    expect(html).toMatch(/<h2 id="prose-heading" class="[^"]*text-highlighted[^"]*">/)
    expect(html).toMatch(/<blockquote class="[^"]*border-accented[^"]*">/)
  })

  it('lets Nuxt UI\'s `Prose*` headings add the heading links, without nesting them', async () => {
    const html = await $fetch<string>('/')
    expect(html.match(/href="#prose-heading"/g)).toHaveLength(1)
  })

  it('prefers a `components/content` component over Nuxt UI\'s global `Prose*` one', async () => {
    const html = await $fetch<string>('/')
    expect(html).toMatch(/<h3 [^>]*class="project-heading"[^>]*>/)
  })

  it('prefers the `components` prop over a `components/content` component', async () => {
    const html = await $fetch<string>('/components-prop')
    expect(html).toMatch(/<h3 class="prop-heading">/)
  })

  it('renders links with `ProseA`', async () => {
    const html = await $fetch<string>('/')
    expect(html).toMatch(/<a href="\/about" class="[^"]*text-primary[^"]*">/)
    expect(html).toMatch(/<a href="https:\/\/nuxt\.com" rel="nofollow" class="[^"]*text-primary[^"]*">/)
  })

  it('renders callout components', async () => {
    const html = await $fetch<string>('/')
    expect(html).toMatch(/bg-info\/10[^>]*>.*?i-lucide:info.*?A note callout/)
    expect(html).toMatch(/bg-success\/10[^>]*>.*?i-lucide:lightbulb.*?A tip callout/)
    expect(html).toMatch(/bg-warning\/10[^>]*>.*?A custom callout/)
  })

  // Building every Nuxt UI component would fail: `UChart` imports `@tanstack/charts`, which isn't installed.
  it('renders a Nuxt UI component used in a document', async () => {
    const html = await $fetch<string>('/')
    expect(html).toMatch(/<button [^>]*>.*?A Nuxt UI button.*?<\/button>/s)
    expect(html).not.toContain('<u-button')
  })

  it('renders a component of a layer installed in `node_modules`', async () => {
    expect(await $fetch<string>('/')).toMatch(/<span class="layer-badge">.*?A layer badge.*?<\/span>/s)
  })
})
