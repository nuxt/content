import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('nuxt ui', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/ui', import.meta.url)),
  })

  it('renders headings with Nuxt UI `Prose*` components', async () => {
    const html = await $fetch<string>('/')
    expect(html).toMatch(/<h1 id="nuxt-ui" class="[^"]*text-highlighted[^"]*">/)
    expect(html).toMatch(/<h2 id="prose-heading" class="[^"]*text-highlighted[^"]*">/)
    expect(html).toMatch(/<blockquote class="[^"]*border-accented[^"]*">/)
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
})
