import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { generateCollectionInsert, defineCollection, resolveCollection, getTableName } from '../../src/utils/collection'

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
    const sql = generateCollectionInsert(collection, {
      id: 'foo.md',
      stem: 'foo',
      extension: 'md',
      meta: {},
    })

    expect(sql[0]).toBe([
      `INSERT INTO ${getTableName('content')}`,
      ' VALUES',
      ' (\'foo.md\', 13, \'2022-01-01T00:00:00.000Z\', \'md\', \'{}\', \'untitled\', true, \'foo\');',
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
    const sql = generateCollectionInsert(collection, {
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
      ' (\'foo.md\', 42, \'2022-01-02T00:00:00.000Z\', \'md\', \'{}\', \'foo\', false, \'foo\');',
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

    const sql = generateCollectionInsert(collection, {
      id: 'foo.md',
      stem: 'foo',
      extension: 'md',
      meta: {},
      content: 'a' + 'b'.repeat(50000) + 'c'.repeat(50000),
    })

    expect(sql[0]).toBe([
      `INSERT INTO ${getTableName('content')}`,
      ' VALUES',
      ' (\'foo.md\', \'a' + 'b'.repeat(50000 - 1) + '\', \'md\', \'{}\', \'foo\');',
    ].join(''))
    expect(sql[1]).toBe([
      `UPDATE ${getTableName('content')}`,
      ' SET',
      ' content = CONCAT(content, \'b' + 'c'.repeat(50000) + '\')',
      ' WHERE id = \'foo.md\';',
    ].join(''))
  })
})
