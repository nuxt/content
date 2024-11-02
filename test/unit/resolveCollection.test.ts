import { describe, expect, test } from 'vitest'
import { resolveCollection, defineCollection } from '../../src/utils/collection'

describe('resolveCollection', () => {
  test('Page without custom schema', () => {
    const collection = defineCollection({
      type: 'page',
      source: 'pages/**',
    })
    const resolvedCollection = resolveCollection('invalid-name', collection)
    expect(resolvedCollection).toBeUndefined()
  })
})
