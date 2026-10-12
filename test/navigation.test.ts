import { describe, expect, it } from 'vitest'
import type { ContentListFile, NavigationItem } from 'comark-content'
import { generateNavigation } from 'comark-content/utils'
import { applyExtraFields, navigationItems, titleFromStem } from '../src/runtime/v3/navigation'

function row(partial: { path: string, stem: string, data?: Record<string, unknown>, key?: string }): ContentListFile {
  return {
    path: partial.path,
    data: partial.data ?? {},
    meta: {
      key: partial.key ?? `docs/${partial.stem}.md`,
      source: 'docs',
      stem: partial.stem,
      extension: '.md',
      kind: 'document',
      type: 'text/markdown',
      partial: true,
    },
  } as ContentListFile
}

describe('navigationItems', () => {
  it('keeps a navigation title the SQL index dropped', async () => {
    // Index wrote `data.navigation.title` but the schema only has `data.navigation`.
    const indexed = row({ path: '/install', stem: 'install', data: { title: 'Install', navigation: null } })
    const listed = row({ path: '/install', stem: 'install', data: { title: 'Install', navigation: { title: 'Getting started', icon: 'i-lucide-rocket' } } })

    const items = await navigationItems({ list: async () => [listed] }, 'docs', [indexed])
    const [link] = await generateNavigation(items)

    expect(link?.title).toBe('Getting started')
    expect(link).toMatchObject({ icon: 'i-lucide-rocket' })
  })

  it('hides a page whose navigation:false the index stored as 0', async () => {
    const indexed = row({ path: '/secret', stem: 'secret', data: { title: 'Secret', navigation: 0 } })
    const listed = row({ path: '/secret', stem: 'secret', data: { title: 'Secret', navigation: false } })

    const items = await navigationItems({ list: async () => [listed] }, 'docs', [indexed])

    expect(await generateNavigation(items)).toEqual([])
  })

  it('titles a page from its file name when neither frontmatter nor the index has one', async () => {
    const indexed = row({ path: '/getting-started', stem: '1.getting-started', data: {} })

    const items = await navigationItems({ list: async () => [] }, 'docs', [indexed])
    const [link] = await generateNavigation(items)

    expect(link?.title).toBe('Getting Started')
  })

  it('ignores listing entries from another collection', async () => {
    const indexed = row({ path: '/shared', stem: 'shared', data: { navigation: null } })
    const other = row({ path: '/shared', stem: 'shared', key: 'blog/shared.md', data: { navigation: { title: 'From blog' } } })
    other.meta.source = 'blog'

    const items = await navigationItems({ list: async () => [other] }, 'docs', [indexed])
    const [link] = await generateNavigation(items)

    expect(link?.title).not.toBe('From blog')
  })
})

describe('applyExtraFields', () => {
  it('copies requested fields onto each link without losing navigation.title', () => {
    const rows = [row({ path: '/docs', stem: 'docs', data: { draft: true, navigation: { title: 'Docs' } } })]
    const tree = [{ title: 'Docs', path: '/docs', stem: 'docs', children: [] }] as NavigationItem[]

    expect(applyExtraFields(tree, rows, ['draft'])[0]).toMatchObject({ title: 'Docs', draft: true })
  })
})

describe('titleFromStem', () => {
  it('strips ordering and the index keyword the way v3 path-meta did', () => {
    expect(titleFromStem('docs/1.getting-started')).toBe('Getting Started')
    expect(titleFromStem('1.index')).toBe('')
    expect(titleFromStem('guide/2.x')).toBe('2.x')
    expect(titleFromStem('mount-damavand')).toBe('Mount Damavand')
  })
})
