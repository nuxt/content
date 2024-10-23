import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { generateCollectionInsert, defineCollection, resolveCollection } from '../../src/utils/collection'
import { getTableName } from '../../src/runtime/internal/app'

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
    }), { rootDir: '~' })!
    const sql = generateCollectionInsert(collection, {
      _id: 'foo.md',
      stem: 'foo',
      extension: 'md',
      meta: {},
    })

    expect(sql).toBe([
      `INSERT INTO ${getTableName('content')}`,
      ' VALUES',
      ' (\'foo.md\', 13, \'2022-01-01T00:00:00.000Z\', \'md\', \'{}\', \'untitled\', true, \'foo\')',
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
    }), { rootDir: '~' })!
    const sql = generateCollectionInsert(collection, {
      _id: 'foo.md',
      stem: 'foo',
      extension: 'md',
      meta: {},
      customField: 42,
      otherField: 'foo',
      otherField2: false,
      date: new Date('2022-01-02'),
    })

    expect(sql).toBe([
      `INSERT INTO ${getTableName('content')}`,
      ' VALUES',
      ' (\'foo.md\', 42, \'2022-01-02T00:00:00.000Z\', \'md\', \'{}\', \'foo\', false, \'foo\')',
    ].join(''))
  })
})
