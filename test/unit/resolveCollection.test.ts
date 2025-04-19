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

  test('Collection hash changes with content', () => {
    const collectionA = defineCollection({
      type: 'page',
      source: '**',
    })
    const collectionB = defineCollection({
      type: 'page',
      source: 'someEmpty/**',
    })
    const resolvedCollectionA = resolveCollection('collection', collectionA)
    const resolvedCollectionB = resolveCollection('collection', collectionB)
    expect(resolvedCollectionA?.hash).toBeDefined()
    expect(resolvedCollectionB?.hash).toBeDefined()
    expect(resolvedCollectionA?.hash).not.toBe(resolvedCollectionB?.hash)
  })
})
