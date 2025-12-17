import { describe, it, expect } from 'vitest'
import { generateSearchSections } from '../../src/runtime/internal/search'
import type { CollectionQueryBuilder, PageCollectionItemBase } from '../../src/types'

describe('generateSearchSections', () => {
  it('should generate basic sections from a page', async () => {
    const mockQueryBuilder = createMockQueryBuilder([{
      path: '/test',
      title: 'Test Page',
      description: 'Page description',
      body: {
        type: 'root',
        children: [
          {
            type: 'element',
            tag: 'h2',
            props: { id: 'section-1' },
            children: [{ type: 'text', value: 'Section 1' }],
          },
          {
            type: 'element',
            tag: 'p',
            children: [{ type: 'text', value: 'Section 1 content' }],
          },
        ],
      },
    }])

    const sections = await generateSearchSections(mockQueryBuilder)

    expect(sections).toEqual([
      {
        id: '/test',
        title: 'Test Page',
        titles: [],
        content: 'Page description',
        level: 1,
      },
      {
        id: '/test#section-1',
        title: 'Section 1',
        titles: ['Test Page'],
        content: 'Section 1 content',
        level: 2,
      },
    ])
  })

  it('should handle nested heading levels correctly', async () => {
    const mockQueryBuilder = createMockQueryBuilder([{
      path: '/test',
      title: 'Test Page',
      description: '',
      body: {
        type: 'root',
        children: [
          {
            type: 'element',
            tag: 'h2',
            props: { id: 'section-1' },
            children: [{ type: 'text', value: 'Section 1' }],
          },
          {
            type: 'element',
            tag: 'p',
            children: [{ type: 'text', value: 'Content 1' }],
          },
          {
            type: 'element',
            tag: 'h3',
            props: { id: 'subsection' },
            children: [{ type: 'text', value: 'Subsection' }],
          },
          {
            type: 'element',
            tag: 'p',
            children: [{ type: 'text', value: 'Subsection content' }],
          },
        ],
      },
    }])

    const sections = await generateSearchSections(mockQueryBuilder)

    expect(sections).toEqual([
      {
        id: '/test',
        title: 'Test Page',
        titles: [],
        content: '',
        level: 1,
      },
      {
        id: '/test#section-1',
        title: 'Section 1',
        titles: ['Test Page'],
        content: 'Content 1',
        level: 2,
      },
      {
        id: '/test#subsection',
        title: 'Subsection',
        titles: ['Test Page', 'Section 1'],
        content: 'Subsection content',
        level: 3,
      },
    ])
  })

  it('should respect ignored tags', async () => {
    const mockQueryBuilder = createMockQueryBuilder([{
      path: '/test',
      title: 'Test Page',
      description: '',
      body: {
        type: 'root',
        children: [
          {
            type: 'element',
            tag: 'h2',
            props: { id: 'section-1' },
            children: [{ type: 'text', value: 'Section 1' }],
          },
          {
            type: 'element',
            tag: 'p',
            children: [
              { type: 'text', value: 'Normal text ' },
              {
                type: 'element',
                tag: 'code',
                children: [{ type: 'text', value: 'ignored code' }],
              },
            ],
          },
        ],
      },
    }])

    const sections = await generateSearchSections(mockQueryBuilder, { ignoredTags: ['code'] })

    expect(sections).toEqual([
      {
        id: '/test',
        title: 'Test Page',
        titles: [],
        content: '',
        level: 1,
      },
      {
        id: '/test#section-1',
        title: 'Section 1',
        titles: ['Test Page'],
        content: 'Normal text',
        level: 2,
      },
    ])
  })

  it('should handle empty body', async () => {
    const mockQueryBuilder = createMockQueryBuilder([{
      path: '/test',
      title: 'Test Page',
      description: 'Description',
      body: null,
    }])

    const sections = await generateSearchSections(mockQueryBuilder)

    expect(sections).toEqual([
      {
        id: '/test',
        title: 'Test Page',
        titles: [],
        content: 'Description',
        level: 1,
      },
    ])
  })

  it('should use default heading range (h1-h6) when not specified', async () => {
    const mockQueryBuilder = createMockQueryBuilder([{
      path: '/test',
      title: 'Test Page',
      description: '',
      body: {
        type: 'root',
        children: [
          { type: 'element', tag: 'h2', props: { id: 's1' }, children: [{ type: 'text', value: 'Section 1' }] },
          { type: 'element', tag: 'p', children: [{ type: 'text', value: 'Content 1' }] },
        ],
      },
    }])

    const sectionsDefault = await generateSearchSections(mockQueryBuilder)
    const sectionsExplicit = await generateSearchSections(mockQueryBuilder, { minHeading: 'h1', maxHeading: 'h6' })

    expect(sectionsDefault).toEqual(sectionsExplicit)
  })

  it('should filter headings by minHeading/maxHeading', async () => {
    const mockQueryBuilder = createMockQueryBuilder([{
      path: '/test',
      title: 'Test Page',
      description: '',
      body: {
        type: 'root',
        children: [
          { type: 'element', tag: 'h1', props: { id: 'h1' }, children: [{ type: 'text', value: 'H1' }] },
          { type: 'element', tag: 'p', children: [{ type: 'text', value: 'P1' }] },
          { type: 'element', tag: 'h2', props: { id: 'h2' }, children: [{ type: 'text', value: 'H2' }] },
          { type: 'element', tag: 'p', children: [{ type: 'text', value: 'P2' }] },
          { type: 'element', tag: 'h3', props: { id: 'h3' }, children: [{ type: 'text', value: 'H3' }] },
          { type: 'element', tag: 'p', children: [{ type: 'text', value: 'P3' }] },
          { type: 'element', tag: 'h4', props: { id: 'h4' }, children: [{ type: 'text', value: 'H4' }] },
          { type: 'element', tag: 'p', children: [{ type: 'text', value: 'P4' }] },
        ],
      },
    }])

    const sections = await generateSearchSections(mockQueryBuilder, { minHeading: 'h2', maxHeading: 'h3' })

    expect(sections).toEqual([
      { id: '/test', title: 'Test Page', titles: [], content: 'H1 P1', level: 1 },
      { id: '/test#h2', title: 'H2', titles: ['Test Page'], content: 'P2', level: 2 },
      { id: '/test#h3', title: 'H3', titles: ['Test Page', 'H2'], content: 'P3 H4 P4', level: 3 },
    ])
  })
})

function createMockQueryBuilder(result: unknown[]) {
  const mockQueryBuilder = {
    where: () => mockQueryBuilder,
    select: () => mockQueryBuilder,
    all: async () => result,
  } as unknown as CollectionQueryBuilder<PageCollectionItemBase>

  return mockQueryBuilder
}
