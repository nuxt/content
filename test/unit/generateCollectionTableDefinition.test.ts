import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { generateCollectionTableDefinition, defineCollection } from '../../src/utils/collection'
import { getTableName } from '../../src/runtime/utils/internal/app'

describe('generateCollectionTableDefinition', () => {
  test('Page without custom schema', () => {
    const collection = defineCollection({
      type: 'page',
      source: 'pages/**',
    })
    const sql = generateCollectionTableDefinition('content', collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      '"body" TEXT,',
      ' contentId TEXT PRIMARY KEY,',
      ' "description" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "navigation" TEXT DEFAULT true,',
      ' "path" VARCHAR,',
      ' "seo" TEXT,',
      ' "stem" VARCHAR,',
      ' "title" VARCHAR',
      ');',
    ].join(''))
  })

  test('Page with custom schema', () => {
    const collection = defineCollection({
      type: 'page',
      source: 'pages/**',
      schema: z.object({
        customField: z.string(),
      }),
    })
    const sql = generateCollectionTableDefinition('content', collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      '"body" TEXT,',
      ' contentId TEXT PRIMARY KEY,',
      ' "customField" VARCHAR,',
      ' "description" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "navigation" TEXT DEFAULT true,',
      ' "path" VARCHAR,',
      ' "seo" TEXT,',
      ' "stem" VARCHAR,',
      ' "title" VARCHAR',
      ');',
    ].join(''))
  })

  test('Data with schema', () => {
    const collection = defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.string(),
      }),
    })
    const sql = generateCollectionTableDefinition('content', collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'contentId TEXT PRIMARY KEY,',
      ' "customField" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR',
      ');',
    ].join(''))
  })

  // Columns
  test('String with max length', () => {
    const collection = defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.string().max(64).default('foo'),
      }),
    })
    const sql = generateCollectionTableDefinition('content', collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'contentId TEXT PRIMARY KEY,',
      ' "customField" VARCHAR(64) DEFAULT \'foo\',',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR',
      ');',
    ].join(''))
  })

  test('Number', () => {
    const collection = defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.number().default(13),
      }),
    })
    const sql = generateCollectionTableDefinition('content', collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'contentId TEXT PRIMARY KEY,',
      ' "customField" INT DEFAULT 13,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR',
      ');',
    ].join(''))
  })

  test('Boolean', () => {
    const collection = defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.boolean().default(false),
      }),
    })
    const sql = generateCollectionTableDefinition('content', collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'contentId TEXT PRIMARY KEY,',
      ' "customField" BOOLEAN DEFAULT false,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR',
      ');',
    ].join(''))
  })

  test('Date', () => {
    const collection = defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.date(),
      }),
    })
    const sql = generateCollectionTableDefinition('content', collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'contentId TEXT PRIMARY KEY,',
      ' "customField" DATE,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR',
      ');',
    ].join(''))
  })

  test('Object', () => {
    const collection = defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.object({
          f1: z.boolean(),
          f2: z.string(),
        }),
      }),
    })
    const sql = generateCollectionTableDefinition('content', collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'contentId TEXT PRIMARY KEY,',
      ' "customField" TEXT,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR',
      ');',
    ].join(''))
  })

  test('Array', () => {
    const collection = defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.array(z.object({
          f1: z.boolean(),
          f2: z.string(),
        })),
      }),
    })
    const sql = generateCollectionTableDefinition('content', collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'contentId TEXT PRIMARY KEY,',
      ' "customField" TEXT,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR',
      ');',
    ].join(''))
  })

  test('Nullable', () => {
    const collection = defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        f1: z.boolean().nullable(),
        f2: z.string().nullable(),
        f3: z.number().nullable(),
        f4: z.date().nullable(),
        f5: z.object({
          f1: z.boolean().nullable(),
          f2: z.string().nullable(),
          f3: z.number().nullable(),
          f4: z.date().nullable(),
        }).nullable(),
        f6: z.array(z.any()).nullable(),
      }),
    })
    const sql = generateCollectionTableDefinition('content', collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'contentId TEXT PRIMARY KEY,',
      ' "extension" VARCHAR,',
      ' "f1" BOOLEAN NULL,',
      ' "f2" VARCHAR NULL,',
      ' "f3" INT NULL,',
      ' "f4" DATE NULL,',
      ' "f5" TEXT NULL,',
      ' "f6" TEXT NULL,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR',
      ');',
    ].join(''))
  })
})
