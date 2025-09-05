import { describe, test, expect, assert } from 'vitest'
import { z } from 'zod'
import { parseContent } from '../utils/content'
import { defineCollection } from '../../src/utils'
import { resolveCollection } from '../../src/utils/collection'
import { initiateValidatorsContext } from '../../src/utils/dependencies'

describe('Parser (.yml)', async () => {
  await initiateValidatorsContext()

  const collection = resolveCollection('content', defineCollection({
    type: 'data',
    source: 'content/**',
    schema: z.object({
      body: z.any(),
    }),
  }))!
  test('key:value', async () => {
    const parsed = await parseContent('content/index.yml', 'key: value', collection)

    expect(parsed).toHaveProperty('id')
    assert(parsed.id === 'content/index.yml')

    expect(parsed.meta).toHaveProperty('key', 'value')
  })

  test('array', async () => {
    const parsed = await parseContent('content/index.yml', '- item 1 \n- item 2', collection)

    expect(parsed).toHaveProperty('id')
    assert(parsed.id === 'content/index.yml')

    expect(parsed).haveOwnProperty('body')
    expect(Array.isArray(parsed.body)).toBeTruthy()
    expect(parsed.body).toHaveLength(2)
    expect(parsed.body).toMatchObject(['item 1', 'item 2'])
  })
})
