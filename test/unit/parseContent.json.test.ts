import { describe, test, expect, assert } from 'vitest'

import { z } from 'zod'
import { parseContent } from '../utils/content'
import { defineCollection } from '../../src/utils'
import { resolveCollection } from '../../src/utils/collection'
import { initiateValidatorsContext } from '../../src/utils/dependencies'

const json = `{
  "key": "value"
}`
const jsonArray = JSON.stringify([
  'item 1',
  'item 2',
])

describe('Parser (json)', async () => {
  await initiateValidatorsContext()

  const collection = resolveCollection('content', defineCollection({
    type: 'data',
    source: 'content/**',
    schema: z.object({
      body: z.any(),
    }),
  }))!
  test('key:value', async () => {
    const parsed = await parseContent('content/index.json', json, collection)

    expect(parsed).toHaveProperty('id')
    assert(parsed.id === 'content/index.json')
    assert(parsed.meta.key === 'value')
  })

  test('array', async () => {
    const parsed = await parseContent('content/index.json', jsonArray, collection)

    expect(parsed).toHaveProperty('id')
    assert(parsed.id === 'content/index.json')

    expect(parsed).haveOwnProperty('body')
    expect(Array.isArray(parsed.body)).toBeTruthy()
    expect(parsed.body).toHaveLength(2)
    expect(parsed.body).toMatchObject(['item 1', 'item 2'])
  })
})
