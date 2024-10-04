import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { generateCollectionInsert, defineCollection, resolveCollection } from '../../src/utils/collection'

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
    }), { rootDir: '~' })
    const sql = generateCollectionInsert(collection, {
      contentId: 'foo.md',
      weight: '999999999999',
      stem: 'foo',
      extension: 'md',
      meta: {},
    })

    expect(sql).toBe([
      'INSERT OR REPLACE INTO content',
      ' ("contentId", "weight", "stem", "extension", "meta", "customField", "otherField", "otherField2", "date")',
      ' VALUES',
      ' (\'foo.md\', \'999999999999\', \'foo\', \'md\', \'{}\', 13, \'untitled\', true, \'2022-01-01T00:00:00.000Z\')',
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
    }), { rootDir: '~' })
    const sql = generateCollectionInsert(collection, {
      contentId: 'foo.md',
      weight: '999999999999',
      stem: 'foo',
      extension: 'md',
      meta: {},
      customField: 42,
      otherField: 'foo',
      otherField2: false,
      date: new Date('2022-01-02'),
    })

    expect(sql).toBe([
      'INSERT OR REPLACE INTO content',
      ' ("contentId", "weight", "stem", "extension", "meta", "customField", "otherField", "otherField2", "date")',
      ' VALUES',
      ' (\'foo.md\', \'999999999999\', \'foo\', \'md\', \'{}\', 42, \'foo\', false, \'2022-01-02T00:00:00.000Z\')',
    ].join(''))
  })
})
