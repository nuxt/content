import { describe, it, expect } from 'vitest'
import { findPageBreadcrumb, findPageChildren, findPageSiblings } from '@nuxt/content/utils'

describe('utils', () => {
  const navigation = [
    {
      title: 'Guide Dir',
      path: '/guide',
      stem: 'guide',
      children: [
        {
          title: 'Guide Index',
          path: '/guide',
          stem: 'guide/index',
        },
        {
          title: 'Getting Started',
          path: '/guide/getting-started',
          stem: 'guide/getting-started',
        },
        {
          title: 'Introduction',
          path: '/guide/introduction',
          stem: 'guide/introduction',
        },
      ],
    },
    {
      title: 'Home',
      path: '/',
      stem: 'index',
    },
  ]

  function removeChildren(array) {
    return array.map((obj) => {
      const { children, ...rest } = obj
      return rest
    })
  }

  it('findPageBreadcrumb index', async () => {
    const breadcrumb = removeChildren(findPageBreadcrumb(navigation, '/guide'))

    expect(breadcrumb).toEqual([])
  })

  it('findPageBreadcrumb index with indexAsChild option', async () => {
    const breadcrumb = removeChildren(findPageBreadcrumb(navigation, '/guide', { indexAsChild: true }))

    expect(breadcrumb).toEqual([
      {
        title: 'Guide Dir',
        path: '/guide',
        stem: 'guide',
      },
    ])
  })

  it('findPageBreadcrumb index with indexAsChild and current option', async () => {
    const breadcrumb = removeChildren(findPageBreadcrumb(navigation, '/guide', { indexAsChild: true, current: true }))

    expect(breadcrumb).toEqual([
      {
        title: 'Guide Dir',
        path: '/guide',
        stem: 'guide',
      },
      {
        title: 'Guide Index',
        path: '/guide',
        stem: 'guide/index',
      },
    ])
  })

  it('findPageBreadcrumb index with current option', async () => {
    const breadcrumb = removeChildren(findPageBreadcrumb(navigation, '/guide', { current: true }))

    expect(breadcrumb).toEqual([
      {
        title: 'Guide Dir',
        path: '/guide',
        stem: 'guide',
      },
    ])
  })

  it('findPageBreadcrumb page', async () => {
    const breadcrumb = removeChildren(findPageBreadcrumb(navigation, '/guide/getting-started'))

    expect(breadcrumb).toEqual([
      {
        title: 'Guide Dir',
        path: '/guide',
        stem: 'guide',
      },
    ])
  })

  it('findPageBreadcrumb page with current option', async () => {
    const breadcrumb = removeChildren(findPageBreadcrumb(navigation, '/guide/getting-started', { current: true }))

    expect(breadcrumb).toEqual([
      {
        title: 'Guide Dir',
        path: '/guide',
        stem: 'guide',
      },
      {
        title: 'Getting Started',
        path: '/guide/getting-started',
        stem: 'guide/getting-started',
      },
    ])
  })

  it('findPageChildren', async () => {
    const breadcrumb = removeChildren(findPageChildren(navigation, '/guide'))

    expect(breadcrumb).toEqual([
      {
        title: 'Getting Started',
        path: '/guide/getting-started',
        stem: 'guide/getting-started',
      },
      {
        title: 'Introduction',
        path: '/guide/introduction',
        stem: 'guide/introduction',
      },
    ])
  })

  it('findPageChildren with indexAsChild option', async () => {
    const breadcrumb = removeChildren(findPageChildren(navigation, '/guide', { indexAsChild: true }))

    expect(breadcrumb).toEqual([
      {
        title: 'Guide Index',
        path: '/guide',
        stem: 'guide/index',
      },
      {
        title: 'Getting Started',
        path: '/guide/getting-started',
        stem: 'guide/getting-started',
      },
      {
        title: 'Introduction',
        path: '/guide/introduction',
        stem: 'guide/introduction',
      },
    ])
  })

  it('findPageSiblings', async () => {
    const breadcrumb = removeChildren(findPageSiblings(navigation, '/guide/getting-started'))

    expect(breadcrumb).toEqual([
      {
        title: 'Introduction',
        path: '/guide/introduction',
        stem: 'guide/introduction',
      },
    ])
  })

  it('findPageSiblings with indexAsChild option', async () => {
    const breadcrumb = removeChildren(findPageSiblings(navigation, '/guide/getting-started', { indexAsChild: true }))

    expect(breadcrumb).toEqual([
      {
        title: 'Guide Index',
        path: '/guide',
        stem: 'guide/index',
      },
      {
        title: 'Introduction',
        path: '/guide/introduction',
        stem: 'guide/introduction',
      },
    ])
  })
})
