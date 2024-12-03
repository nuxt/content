import { describe, it, expect } from 'vitest'
import type { ContentNavigationItem } from '@nuxt/content'
import { flattedData, generateItemSurround } from '../../src/runtime/internal/surround'

describe('generateItemSurround', () => {
  const mockQueryBuilder = {
    find: async () => mockData,
    where: () => mockQueryBuilder,
    orWhere: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    only: () => mockQueryBuilder,
    select: () => mockQueryBuilder,
    all: async () => mockData,
  }

  const mockData: ContentNavigationItem[] = [
    {
      title: 'Item 1',
      path: '/item-1',
      id: '1',
      stem: '1-item-1',
    },
    {
      title: 'Item 2',
      path: '/item-2',
      id: '2',
      stem: '2-item-2',
    },
    {
      title: 'Section',
      path: '/section',
      id: '3',
      stem: '3-section',
    },
    {
      title: 'Item 3',
      path: '/section/item-3',
      id: '4',
      stem: '3-section/item-3',
    },
    {
      title: 'Item 4',
      path: '/section/item-4',
      id: '5',
      stem: '3-section/item-4',
    },
    {
      title: 'Item 5',
      path: '/item-5',
      id: '6',
      stem: '4-item-5',
    },
  ]

  it('flattedData should flatten the navigation structure', () => {
    const flatResult = flattedData([
      {
        title: 'Item 1',
        path: '/item-1',
        id: '1',
        stem: '1-item-1',
      },
      {
        title: 'Item 2',
        path: '/item-2',
        id: '2',
        stem: '2-item-2',
      },
      {
        title: 'Section',
        path: '/section',
        id: '3',
        stem: '3-section',
        children: [
          {
            title: 'Item 3',
            path: '/section/item-3',
            id: '4',
            stem: '3-section/item-3',
          },
          {
            title: 'Item 4',
            path: '/section/item-4',
            id: '5',
            stem: '3-section/item-4',
          },
        ],
      },
      {
        title: 'Item 5',
        path: '/item-5',
        id: '6',
        stem: '4-item-5',
      },
    ])

    expect(flatResult).toEqual([
      { title: 'Item 1', path: '/item-1', id: '1', stem: '1-item-1' },
      { title: 'Item 2', path: '/item-2', id: '2', stem: '2-item-2' },
      { title: 'Section', path: '/section', id: '3', stem: '3-section' },
      { title: 'Item 3', path: '/section/item-3', id: '4', stem: '3-section/item-3' },
      { title: 'Item 4', path: '/section/item-4', id: '5', stem: '3-section/item-4' },
      { title: 'Item 5', path: '/item-5', id: '6', stem: '4-item-5' },
    ])
  })

  it('flattedData should flatten the navigation structure with page false', () => {
    const mockDataWithPageFalse = [
      {
        title: 'Item 1',
        path: '/item-1',
        id: '1',
        stem: '1-item-1',
        page: false,
      },
      {
        title: 'Item 2',
        path: '/item-2',
        id: '2',
        stem: '2-item-2',
      },
      {
        title: 'Section',
        path: '/section',
        id: '3',
        stem: '3-section',
        children: [
          {
            title: 'Item 3',
            path: '/section/item-3',
            id: '4',
            stem: '3-section/item-3',
          },
          {
            title: 'Item 4',
            path: '/section/item-4',
            id: '5',
            stem: '3-section/item-4',
          },
        ],
      },
      {
        title: 'Item 5',
        path: '/item-5',
        id: '6',
        stem: '4-item-5',
      },
    ]

    const flatResult = flattedData(mockDataWithPageFalse as ContentNavigationItem[])

    expect(flatResult).toEqual([
      { title: 'Item 2', path: '/item-2', id: '2', stem: '2-item-2' },
      { title: 'Section', path: '/section', id: '3', stem: '3-section' },
      { title: 'Item 3', path: '/section/item-3', id: '4', stem: '3-section/item-3' },
      { title: 'Item 4', path: '/section/item-4', id: '5', stem: '3-section/item-4' },
      { title: 'Item 5', path: '/item-5', id: '6', stem: '4-item-5' },
    ])
  })
  it('flattedData should flatten the navigation structure with parent as first child', () => {
    const mockDataWithPageFalse = [
      {
        title: 'Item 1',
        path: '/item-1',
        id: '1',
        stem: '1-item-1',
      },
      {
        title: 'Item 2',
        path: '/item-2',
        id: '2',
        stem: '2-item-2',
      },
      {
        title: 'Section',
        path: '/section',
        id: '3',
        stem: '3-section',
        children: [
          {
            title: 'Item 3',
            path: '/section',
            id: '4',
            stem: '3-section/index',
          },
          {
            title: 'Item 4',
            path: '/section/item-4',
            id: '5',
            stem: '3-section/item-4',
          },
        ],
      },
      {
        title: 'Item 5',
        path: '/item-5',
        id: '6',
        stem: '4-item-5',
      },
    ]

    const flatResult = flattedData(mockDataWithPageFalse as ContentNavigationItem[])

    expect(flatResult).toEqual([
      { title: 'Item 1', path: '/item-1', id: '1', stem: '1-item-1' },
      { title: 'Item 2', path: '/item-2', id: '2', stem: '2-item-2' },
      { title: 'Item 3', path: '/section', id: '4', stem: '3-section/index' },
      { title: 'Item 4', path: '/section/item-4', id: '5', stem: '3-section/item-4' },
      { title: 'Item 5', path: '/item-5', id: '6', stem: '4-item-5' },
    ])
  })

  it('returns correct surrounding items', async () => {
    const result = await generateItemSurround(mockQueryBuilder, '/item-2')

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ path: '/item-1' })
    expect(result[1]).toMatchObject({ path: '/section' })
  })

  it('handles start of list', async () => {
    const result = await generateItemSurround(mockQueryBuilder, '/item-1')

    expect(result).toHaveLength(2)
    expect(result[0]).toBeNull()
    expect(result[1]).toMatchObject({ path: '/item-2' })
  })

  it('handles end of list', async () => {
    const result = await generateItemSurround(mockQueryBuilder, '/item-5')

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ path: '/section/item-4' })
    expect(result[1]).toBeNull()
  })

  it('respects before/after options', async () => {
    const result = await generateItemSurround(mockQueryBuilder, '/section/item-3', {
      before: 2,
      after: 2,
    })

    expect(result).toHaveLength(4)
    expect(result[0]).toMatchObject({ path: '/item-2' })
    expect(result[1]).toMatchObject({ path: '/section' })
    expect(result[2]).toMatchObject({ path: '/section/item-4' })
    expect(result[3]).toMatchObject({ path: '/item-5' })
  })

  it('handles nested navigation correctly', async () => {
    const result = await generateItemSurround(mockQueryBuilder, '/section/item-4')

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ path: '/section/item-3' })
    expect(result[1]).toMatchObject({ path: '/item-5' })
  })

  it('returns empty array for non-existent path', async () => {
    const result = await generateItemSurround(mockQueryBuilder, '/non-existent')

    expect(result).toHaveLength(2)
    expect(result[0]).toBeNull()
    expect(result[1]).toBeNull()
  })

  it('handles section items correctly', async () => {
    const result = await generateItemSurround(mockQueryBuilder, '/section/item-3')

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ path: '/section' })
    expect(result[1]).toMatchObject({ path: '/section/item-4' })
  })
})
