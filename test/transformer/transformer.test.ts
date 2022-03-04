import { describe, test, expect, assert } from 'vitest'
import * as transformer from '../../src/runtime/server/transformer/transformer'

describe('Transformer', () => {
  test('Parse', async () => {
    expect(transformer.parse).toBeDefined()
    expect(transformer.parse).toBeInstanceOf(Function)
    const parsed = await transformer.parse('content:index.md', '# Index')

    expect(parsed).toHaveProperty('meta.id')
    assert(parsed.meta.id === 'content:index.md')

    expect(parsed).toHaveProperty('body')
    expect(parsed).toMatchSnapshot('transformer-index-parsed')
  })
})
