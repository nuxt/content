import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

type NavigationItem = { title: string, path: string, icon?: string, children?: NavigationItem[] }

function findItem(items: NavigationItem[], path: string): NavigationItem | undefined {
  for (const item of items) {
    if (item.path === path) return item
    const found = item.children && findItem(item.children, path)
    if (found) return found
  }
}

describe('data files', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/data-files', import.meta.url)),
  })

  // v3 parses YAML and JSON files, so v3 mode has to as well.
  it('applies `.navigation.yml` to its folder', async () => {
    const navigation = await $fetch<NavigationItem[]>('/api/navigation')
    expect(findItem(navigation, '/docs/guide')).toMatchObject({ title: 'Getting Started Guide', icon: 'i-lucide-rocket' })
  })

  it('reads a YAML data collection', async () => {
    const authors = await $fetch<Array<{ name: string }>>('/api/authors')
    expect(authors.map(author => author.name)).toEqual(['Ahad'])
  })

  it('reads a JSON data collection', async () => {
    const sponsors = await $fetch<Array<{ name: string }>>('/api/sponsors')
    expect(sponsors.map(sponsor => sponsor.name)).toEqual(['Vercel'])
  })
})
