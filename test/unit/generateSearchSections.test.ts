import { describe, it, expect, expectTypeOf } from 'vitest'
import { generateSearchSections } from '../../src/runtime/internal/search'
import type { Section } from '../../src/runtime/internal/search'
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

  it('should add extra fields to results', async () => {
    const mockQueryBuilder = createMockQueryBuilder([{
      path: '/test',
      title: 'Test Page',
      description: 'Page description',
      author: 'John Doe',
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

    const sections = await generateSearchSections(mockQueryBuilder, { extraFields: ['author'] })

    expect(sections).toEqual([
      {
        id: '/test',
        title: 'Test Page',
        titles: [],
        content: 'Page description',
        level: 1,
        author: 'John Doe',
      },
      {
        id: '/test#section-1',
        title: 'Section 1',
        titles: ['Test Page'],
        content: 'Section 1 content',
        level: 2,
        author: 'John Doe',
      },
    ])
  })

  it('should narrow return type to Section & Pick<T, K> when extraFields is provided', async () => {
    type DocItem = PageCollectionItemBase & { author: string }
    const mockQB = createMockQueryBuilder<DocItem>([{
      path: '/test',
      title: 'Test Page',
      description: '',
      author: 'Jane Doe',
      body: null,
    }])

    const result = await generateSearchSections(mockQB, { extraFields: ['author'] as const })
    expectTypeOf(result).toEqualTypeOf<Array<Section & Pick<DocItem, 'author'>>>()
  })

  describe('word boundaries', () => {
    it('should separate table cells and rows', async () => {
      const content = await extractSectionContent([
        el('table', [
          el('thead', [el('tr', [el('th', ['Setting Name']), el('th', ['Description'])])]),
          el('tbody', [
            el('tr', [el('td', ['api_key']), el('td', ['Your API authentication key'])]),
            el('tr', [el('td', ['timeout_ms']), el('td', ['Request timeout'])]),
          ]),
        ]),
      ])

      expect(content).toBe('Setting Name Description api_key Your API authentication key timeout_ms Request timeout')
    })

    it('should separate table cells in minimark bodies', async () => {
      const sections = await generateSearchSections(createMockQueryBuilder([{
        path: '/test',
        title: 'Test Page',
        description: '',
        body: {
          type: 'minimark',
          value: [
            ['h2', { id: 'table' }, 'Table'],
            ['table', {}, ['tbody', {}, ['tr', {}, ['td', {}, 'first'], ['td', {}, 'second']]]],
          ],
        },
      }]))

      expect(sections[1]!.content).toBe('first second')
    })

    it('should separate list items, including nested and loose lists', async () => {
      const content = await extractSectionContent([
        el('ul', [el('li', ['alpha']), el('li', ['beta'])]),
        el('ol', [
          el('li', ['parent\n', el('ul', [el('li', ['child']), el('li', ['kid'])])]),
          el('li', [el('p', ['first para']), el('p', ['second para'])]),
        ]),
      ])

      expect(content).toBe('alpha beta parent\nchild kid first para second para')
    })

    it('should separate paragraphs inside blockquotes', async () => {
      const content = await extractSectionContent([
        el('blockquote', [el('p', ['line one']), el('p', ['line two'])]),
      ])

      expect(content).toBe('line one line two')
    })

    it('should separate block content of nested MDC components and slots', async () => {
      const content = await extractSectionContent([
        el('card-group', [
          el('card', [el('p', ['First'])]),
          el('card', [el('p', ['Second'])]),
        ]),
        el('callout', [
          el('template', [el('p', ['TitleText'])], { 'v-slot:title': '' }),
          el('p', ['BodyText']),
        ]),
      ])

      expect(content).toBe('First Second TitleText BodyText')
    })

    it('should separate text around <br> and <hr>', async () => {
      const content = await extractSectionContent([
        el('p', ['word', el('br', []), 'other']),
        el('p', ['line one', el('br', []), '\nline two']),
        el('div', ['above', el('hr', []), 'below']),
      ])

      expect(content).toBe('word other line one\nline two above below')
    })

    it('should not repeat whitespace across nested block boundaries', async () => {
      const content = await extractSectionContent([
        el('div', [
          el('table', [el('tbody', [
            el('tr', [el('td', [el('p', ['a'])]), el('td', [el('ul', [el('li', ['b'])])])]),
            el('tr', [el('td', ['c ']), el('td', ['d'])]),
          ])]),
          el('blockquote', [el('p', ['e'])]),
        ]),
      ])

      expect(content).toBe('a b c d e')
    })

    it('should keep a single boundary around ignored blocks', async () => {
      const sections = await generateSearchSections(createMockQueryBuilder([{
        path: '/test',
        title: 'Test Page',
        description: '',
        body: {
          type: 'root',
          children: [
            el('h2', ['Section'], { id: 'section' }),
            el('div', [el('p', ['before']), el('pre', ['ignored']), el('p', ['after'])]),
          ],
        },
      }]), { ignoredTags: ['pre'] })

      expect(sections[1]!.content).toBe('before after')
    })

    it('should preserve inline text exactly', async () => {
      const content = await extractSectionContent([
        el('p', [
          'foo', el('strong', ['bar']), 'baz un', el('em', ['bold']), 'ed ',
          el('strong', ['Note']), ': see ', el('a', ['docs'], { href: '/d' }), ', then ', el('code', ['run()']), '! ',
          'x', el('code', ['y']), 'z ', el('badge', ['beta']), el('span', ['one']), el('span', ['two']),
        ]),
        el('p', ['日本', el('strong', ['語']), 'です']),
        el('table', [el('tbody', [el('tr', [el('td', [el('strong', ['bold']), 'cell'])])])]),
      ])

      expect(content).toBe('foobarbaz unbolded Note: see docs, then run()! xyz betaonetwo 日本語です boldcell')
    })

    it('should preserve inline text in headings', async () => {
      const sections = await generateSearchSections(createMockQueryBuilder([{
        path: '/test',
        title: 'Test Page',
        description: '',
        body: {
          type: 'root',
          children: [el('h2', ['Use ', el('code', ['useFetch']), '() for ', el('em', ['data']), 'fetching'], { id: 'use-fetch' })],
        },
      }]))

      expect(sections[1]!.title).toBe('Use useFetch() for datafetching')
    })
  })
})

async function extractSectionContent(children: unknown[]) {
  const sections = await generateSearchSections(createMockQueryBuilder([{
    path: '/test',
    title: 'Test Page',
    description: '',
    body: {
      type: 'root',
      children: [el('h2', ['Section'], { id: 'section' }), ...children],
    },
  }]))

  return sections[1]!.content
}

function el(tag: string, children: unknown[], props: Record<string, unknown> = {}): unknown {
  return {
    type: 'element',
    tag,
    props,
    children: children.map(child => typeof child === 'string' ? { type: 'text', value: child } : child),
  }
}

function createMockQueryBuilder<T extends PageCollectionItemBase>(result: unknown[]) {
  const mockQueryBuilder = {
    where: () => mockQueryBuilder,
    select: () => mockQueryBuilder,
    all: async () => result,
  } as unknown as CollectionQueryBuilder<T>

  return mockQueryBuilder
}
