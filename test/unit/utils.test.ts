import { describe, it, expect } from 'vitest'
import { findPageBreadcrumb, findPageChildren, findPageSiblings, findPageHeadline } from '@nuxt/content/utils'

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

  const navigation2 = [
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
          title: 'Getting Started Dir',
          path: '/guide/getting-started',
          stem: 'guide/getting-started',
          children: [
            {
              title: 'Getting Started Index',
              path: '/guide/getting-started',
              stem: 'guide/getting-started/index',
            },
            {
              title: 'Getting Started 1',
              path: '/guide/getting-started/1',
              stem: 'guide/getting-started/1',
            },
            {
              title: 'Getting Started 2',
              path: '/guide/getting-started/2',
              stem: 'guide/getting-started/2',
            },
          ],
        },
        {
          title: 'Introduction',
          path: '/guide/introduction',
          stem: 'guide/introduction',
        },
      ],
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
    const pages = removeChildren(findPageChildren(navigation, '/guide'))

    expect(pages).toEqual([
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
    const pages = removeChildren(findPageChildren(navigation, '/guide', { indexAsChild: true }))

    expect(pages).toEqual([
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
    const pages = removeChildren(findPageSiblings(navigation, '/guide/getting-started'))

    expect(pages).toEqual([
      {
        title: 'Introduction',
        path: '/guide/introduction',
        stem: 'guide/introduction',
      },
    ])
  })

  it('findPageSiblings with indexAsChild option', async () => {
    const pages = removeChildren(findPageSiblings(navigation, '/guide/getting-started', { indexAsChild: true }))

    expect(pages).toEqual([
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

  it('findPageHeadline', async () => {
    const headline = findPageHeadline(navigation2, '/guide/getting-started')

    expect(headline).toEqual('Guide Dir')
  })

  it('findPageHeadline for index with indexAsChild', async () => {
    const headline = findPageHeadline(navigation2, '/guide', { indexAsChild: true })

    expect(headline).toEqual('Guide Dir')

    const headline2 = findPageHeadline(navigation2, '/guide/getting-started', { indexAsChild: true })

    expect(headline2).toEqual('Getting Started Dir')
  })

  it('findPageHeadline for index without indexAsChild', async () => {
    const headline = findPageHeadline(navigation2, '/guide')

    expect(headline).toEqual(undefined)

    const headline2 = findPageHeadline(navigation2, '/guide/getting-started')

    expect(headline2).toEqual('Guide Dir')
  })
})
