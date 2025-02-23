import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { generateCollectionInsert, defineCollection, resolveCollection, getTableName, SLICE_SIZE, MAX_SQL_QUERY_SIZE } from '../../src/utils/collection'

describe('generateCollectionInsert', () => {
  test('Respect Schema\'s default values', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'data',
      source: '**',
      schema: z.object({
        customField: z.number().default(13),
        otherField: z.string().default('untitled'),
        otherField2: z.boolean().default(true),
        date: z.date().default(new Date('2022-01-01')),
      }),
    }))!
    const { queries: sql } = generateCollectionInsert(collection, {
      id: 'foo.md',
      stem: 'foo',
      extension: 'md',
      meta: {},
    })

    expect(sql[0]).toBe([
      `INSERT INTO ${getTableName('content')}`,
      ' VALUES',
      ' (\'foo.md\', 13, \'2022-01-01T00:00:00.000Z\', \'md\', \'{}\', \'untitled\', true, \'foo\', \'mQvteGg7Ce\');',
    ].join(''))
  })

  test('Overwrite default fields', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'data',
      source: '**',
      schema: z.object({
        customField: z.number().default(13),
        otherField: z.string().default('untitled'),
        otherField2: z.boolean().default(true),
        date: z.date().default(new Date('2022-01-01')),
      }),
    }))!
    const { queries: sql } = generateCollectionInsert(collection, {
      id: 'foo.md',
      stem: 'foo',
      extension: 'md',
      meta: {},
      customField: 42,
      otherField: 'foo',
      otherField2: false,
      date: new Date('2022-01-02'),
    })

    expect(sql[0]).toBe([
      `INSERT INTO ${getTableName('content')}`,
      ' VALUES',
      ' (\'foo.md\', 42, \'2022-01-02T00:00:00.000Z\', \'md\', \'{}\', \'foo\', false, \'foo\', \'JQYUxSZR3f\');',
    ].join(''))
  })

  test('Split long values', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'data',
      source: '**',
      schema: z.object({
        content: z.string().max(10000),
      }),
    }))!

    const content = (Array.from({ length: 20000 })).fill('lorem ipsum dolor sit amet - ').map((val, i) => val + i.toString()).join(' ')

    const { queries: sql } = generateCollectionInsert(collection, {
      id: 'foo.md',
      stem: 'foo',
      extension: 'md',
      meta: {},
      content,
    })

    const querySlices: string[] = [content.slice(0, SLICE_SIZE - 1)]
    for (let i = 1; i < (content.length / SLICE_SIZE); i++) {
      querySlices.push(content.slice((SLICE_SIZE * i) - 1, (SLICE_SIZE * (i + 1)) - 1))
    }

    // check that the content will be split into multiple queries
    expect(content.length).toBeGreaterThan(MAX_SQL_QUERY_SIZE)

    // check that concatenated all the values are equal to the original content
    expect(content).toEqual(querySlices.join(''))

    expect(sql[0]).toBe([
      `INSERT INTO ${getTableName('content')}`,
      ' VALUES',
      ` ('foo.md', '${querySlices[0]}', 'md', '{}', 'foo', 'AeIX0GRxup');`,
    ].join(''))
    let index = 1
    while (index < sql.length - 1) {
      expect(sql[index]).toBe([
        `UPDATE ${getTableName('content')}`,
        ' SET',
        ` content = CONCAT(content, '${querySlices[index]}')`,
        ' WHERE id = \'foo.md\';',
      ].join(''))
      index++
    }
  })
})
