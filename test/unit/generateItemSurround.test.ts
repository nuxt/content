import { describe, it, expect } from 'vitest'
import { flattedData, generateItemSurround } from '../../src/runtime/internal/surround'
import type { ContentNavigationItem } from '@nuxt/content'

describe('generateItemSurround', () => {
  const mockQueryBuilder = {
    find: async () => mockData,
    where: () => mockQueryBuilder,
    orWhere: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    only: (_field: string, _direction: 'ASC' | 'DESC') => mockQueryBuilder,
    select: () => mockQueryBuilder,
    all: async () => mockData,
  }
  const createMockQueryBuilder = (mockData: Array<Record<string, unknown>>) => ({
    find: async () => mockData,
    where: () => createMockQueryBuilder(mockData),
    orWhere: () => createMockQueryBuilder(mockData),
    order: (field: string, direction: 'ASC' | 'DESC') => {
      return createMockQueryBuilder(mockData.sort((a, b) => {
        if (direction === 'ASC') {
          return (a[field] as string) < (b[field] as string) ? -1 : 1
        }
        return (a[field] as string) > (b[field] as string) ? -1 : 1
      }))
    },
    only: () => createMockQueryBuilder(mockData),
    select: () => createMockQueryBuilder(mockData),
    all: async () => mockData,
  })

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

  it('Respect user order', async () => {
    const mockQueryBuilder = createMockQueryBuilder([
      // 1.first-article with a date field set to 2024-01-01.
      // 2.second-article with a date field set to 2025-01-01.
      {
        path: '/first-article',
        id: '1',
        stem: '1-first-article',
        date: new Date('2024-01-01'),
      },
      {
        path: '/second-article',
        id: '2',
        stem: '2-second-article',
        date: new Date('2025-01-01'),
      },
      {
        path: '/third-article',
        id: '3',
        stem: '3-third-article',
        date: new Date('2026-01-01'),
      },
    ])
    const queryBuilder = mockQueryBuilder.order('date', 'DESC')
    // @ts-expect-error -- internal
    queryBuilder.__params = {
      orderBy: ['"date" DESC'],
    }
    const result = await generateItemSurround(queryBuilder, '/second-article')

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ path: '/third-article' })
    expect(result[1]).toMatchObject({ path: '/first-article' })
  })
})
