import { describe, it, expect } from 'vitest'
import type { PageCollectionItemBase } from '@nuxt/content'
import { generateNavigationTree } from '../../src/runtime/internal/navigation'

describe('generateNavigationTree', () => {
  const mockQueryBuilder = (items: PageCollectionItemBase[]) => ({
    order: () => mockQueryBuilder(items),
    orWhere: () => mockQueryBuilder(items),
    select: () => mockQueryBuilder(items),
    all: async () => items,
  })

  it('should generate a basic navigation tree', async () => {
    const items = [
      {
        title: 'Home',
        path: '/',
        stem: 'index',
      },
      {
        title: 'About',
        path: '/about',
        stem: 'about',
      },
    ] as PageCollectionItemBase[]

    const tree = await generateNavigationTree(mockQueryBuilder(items))

    expect(tree).toEqual([
      {
        title: 'About',
        path: '/about',
        stem: 'about',
      },
      {
        title: 'Home',
        path: '/',
        stem: 'index',
      },
    ])
  })

  it('should generate a basic navigation tree with order', async () => {
    const items = [
      {
        title: 'Home',
        path: '/',
        stem: '1.index',
      },
      {
        title: 'About',
        path: '/about',
        stem: '2.about',
      },
    ] as PageCollectionItemBase[]

    const tree = await generateNavigationTree(mockQueryBuilder(items))

    expect(tree).toEqual([
      {
        title: 'Home',
        path: '/',
        stem: '1.index',
      },
      {
        title: 'About',
        path: '/about',
        stem: '2.about',
      },
    ])
  })

  it('should handle nested navigation structure', async () => {
    const items = [
      {
        title: 'Home',
        path: '/',
        stem: 'index',
      },
      {
        title: 'Guide',
        path: '/guide',
        stem: 'guide/index',
      },
      {
        title: 'Getting Started',
        path: '/guide/getting-started',
        stem: 'guide/getting-started',
      },
    ] as PageCollectionItemBase[]

    const tree = await generateNavigationTree(mockQueryBuilder(items))

    expect(tree).toEqual([
      {
        title: 'Guide',
        path: '/guide',
        stem: 'guide/index',
        children: [
          {
            title: 'Getting Started',
            path: '/guide/getting-started',
            stem: 'guide/getting-started',
          },
          {
            title: 'Guide',
            path: '/guide',
            stem: 'guide/index',
          },
        ],
      },
      {
        title: 'Home',
        path: '/',
        stem: 'index',
      },
    ])
  })

  it('should respect navigation configuration', async () => {
    const items = [
      {
        title: 'Navigation',
        path: '/guide/.navigation',
        stem: 'guide/.navigation',
        navigation: {
          title: 'Custom Guide Title',
        },
      },
      {
        title: 'Guide',
        path: '/guide',
        stem: 'guide/index',
      },
      {
        title: 'Page',
        path: '/guide/page',
        stem: 'guide/page',
      },
    ] as PageCollectionItemBase[]

    const tree = await generateNavigationTree(mockQueryBuilder(items))

    expect(tree).toEqual([
      {
        title: 'Custom Guide Title',
        path: '/guide',
        stem: 'guide/index',
        children: [
          {
            title: 'Guide',
            path: '/guide',
            stem: 'guide/index',
          },
          {
            title: 'Page',
            path: '/guide/page',
            stem: 'guide/page',
          },
        ],
      },
    ])
  })

  it('should exclude items with navigation: false', async () => {
    const items = [
      {
        title: 'Navigation',
        path: '/hidden/.navigation',
        stem: 'hidden/.navigation',
        navigation: false,
      },
      {
        title: 'Hidden',
        path: '/hidden',
        stem: 'hidden/index',
      },
      {
        title: 'Visible',
        path: '/visible',
        stem: 'visible',
      },
    ] as PageCollectionItemBase[]

    const tree = await generateNavigationTree(mockQueryBuilder(items))

    expect(tree).toEqual([
      {
        title: 'Visible',
        path: '/visible',
        stem: 'visible',
      },
    ])
  })

  it('should sort items numerically and alphabetically', async () => {
    const items = [
      {
        title: 'Z Page',
        path: '/z-page',
        stem: 'z-page',
      },
      {
        title: 'Page 2',
        path: '/page-2',
        stem: '2.page-2',
      },
      {
        title: 'Page 1',
        path: '/page-1',
        stem: '1.page-1',
      },
      {
        title: 'A Page',
        path: '/a-page',
        stem: 'a-page',
      },
    ] as PageCollectionItemBase[]

    const tree = await generateNavigationTree(mockQueryBuilder(items))

    expect(tree.map(item => item.path)).toEqual([
      '/page-1',
      '/page-2',
      '/a-page',
      '/z-page',
    ])
  })

  it('should handle extra fields', async () => {
    const items = [
      {
        title: 'Home',
        path: '/',
        stem: 'index',
        description: 'Home page',
        customField: 'custom value',
      },
    ] as Array<PageCollectionItemBase & { customField: string }>

    const tree = await generateNavigationTree(mockQueryBuilder(items), ['description', 'customField'] as Array<keyof PageCollectionItemBase>)

    expect(tree[0]).toHaveProperty('description', 'Home page')
    expect(tree[0]).toHaveProperty('customField', 'custom value')
  })
})
