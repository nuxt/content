import { describe, it, expect, vi } from 'vitest'

import { replaceComponentSchemas } from '../../src/utils/schema'

const mockedSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    count: { type: 'number' },
  },
  required: ['title'],
  additionalProperties: false,
}

vi.mock('@nuxt/kit', () => ({
  useNuxt: () => ({ options: { rootDir: '/project/root' } }),
  resolveModule: (p: string) => p.startsWith('~') ? `/resolved/${p.slice(1)}` : p,
}))

vi.mock('nuxt-component-meta/parser', () => ({
  getComponentMeta: (path: string) => ({
    path,
    props: [{ name: 'title' }, { name: 'count' }],
  }),
}))

vi.mock('nuxt-component-meta/utils', () => ({
  propsToJsonSchema: () => mockedSchema,
}))

describe('replaceComponentSchemas', () => {
  it('returns property unchanged when type is not object', () => {
    const input = { type: 'string' }
    const result = replaceComponentSchemas(input)
    expect(result).toEqual(input)
  })

  it('replaces top-level object with $content.inherit using component props schema', () => {
    const input = {
      type: 'object',
      $content: { inherit: '~/components/MyComponent.vue' },
    }

    const result = replaceComponentSchemas(input)
    expect(result).toEqual(mockedSchema)
  })

  it('recursively replaces nested properties with $content.inherit and preserves others', () => {
    const input = {
      type: 'object',
      properties: {
        staticField: { type: 'string' },
        nested: {
          type: 'object',
          $content: { inherit: '~/components/Nested.vue' },
        },
      },
      required: [],
      additionalProperties: false,
    }

    const result = replaceComponentSchemas(input)
    expect(result).toEqual({
      type: 'object',
      properties: {
        staticField: { type: 'string' },
        nested: mockedSchema,
      },
      required: [],
      additionalProperties: false,
    })
  })
})
