import { describe, test, expect, assert } from 'vitest'

import { z } from 'zod'
import { parseContent } from '../../src/utils/content'
import { defineCollection } from '../../src/utils'
import { resolveCollection } from '../../src/utils/collection'

const json = `{
  "key": "value"
}`
const jsonArray = JSON.stringify([
  'item 1',
  'item 2',
])
const json5 = `{
  key: 'value',
  // comments
  unquoted: 'and you can quote me on that',
  singleQuotes: 'I can use "double quotes" here',
  lineBreaks: "Look, Mom! \
No \\n's!",
  hexadecimal: 0xdecaf,
  leadingDecimalPoint: .8675309, andTrailing: 8675309.,
  positiveSign: +1,
  trailingComma: 'in objects', andIn: ['arrays',],
  "backwardsCompatible": "with JSON",
}`

describe('Parser (json)', () => {
  const collection = resolveCollection('content', defineCollection({
    type: 'data',
    source: 'content/**',
    schema: z.object({
      body: z.any(),
    }),
  }))
  test('key:value', async () => {
    const parsed = await parseContent('content/index.json', json, collection)

    expect(parsed).toHaveProperty('contentId')
    assert(parsed.contentId === 'content/index.json')
    assert(parsed.meta.key === 'value')
  })

  test('array', async () => {
    const parsed = await parseContent('content/index.json', jsonArray, collection)

    expect(parsed).toHaveProperty('contentId')
    assert(parsed.contentId === 'content/index.json')

    expect(parsed).haveOwnProperty('body')
    expect(Array.isArray(parsed.body)).toBeTruthy()
    expect(parsed.body).toHaveLength(2)
    expect(parsed.body).toMatchObject(['item 1', 'item 2'])
  })

  test('json5 key:value', async () => {
    const parsed = await parseContent('content/index.json5', json5, collection)

    expect(parsed).toHaveProperty('contentId')
    assert(parsed.contentId === 'content/index.json5')
    assert(parsed.meta.key === 'value')

    expect(parsed.meta.leadingDecimalPoint).toEqual(0.8675309)
    expect(parsed.meta.andTrailing).toEqual(8675309)
    expect(parsed.meta.lineBreaks).toEqual('Look, Mom! No \n\'s!')
  })
})
