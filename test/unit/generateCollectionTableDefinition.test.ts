import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { generateCollectionTableDefinition, defineCollection } from '../../src/utils/collection'

describe('generateCollectionTableDefinition', () => {
  test('Page without custom schema', () => {
    const collection = defineCollection({
      type: 'page',
      source: 'pages/**',
    })
    const sql = generateCollectionTableDefinition('content', collection)

    expect(sql).toBe([
      'CREATE TABLE IF NOT EXISTS content (',
      'contentId TEXT PRIMARY KEY,',
      ' "weight" VARCHAR,',
      ' "stem" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "path" VARCHAR,',
      ' "title" VARCHAR,',
      ' "description" VARCHAR,',
      ' "seo" TEXT,',
      ' "body" TEXT,',
      ' "navigation" TEXT DEFAULT true',
      ')',
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
      'CREATE TABLE IF NOT EXISTS content (',
      'contentId TEXT PRIMARY KEY,',
      ' "weight" VARCHAR,',
      ' "stem" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "path" VARCHAR,',
      ' "title" VARCHAR,',
      ' "description" VARCHAR,',
      ' "seo" TEXT,',
      ' "body" TEXT,',
      ' "navigation" TEXT DEFAULT true,',
      ' "customField" VARCHAR',
      ')',
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
      'CREATE TABLE IF NOT EXISTS content (',
      'contentId TEXT PRIMARY KEY,',
      ' "weight" VARCHAR,',
      ' "stem" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "customField" VARCHAR',
      ')',
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
      'CREATE TABLE IF NOT EXISTS content (',
      'contentId TEXT PRIMARY KEY,',
      ' "weight" VARCHAR,',
      ' "stem" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "customField" VARCHAR(64) DEFAULT \'foo\'',
      ')',
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
      'CREATE TABLE IF NOT EXISTS content (',
      'contentId TEXT PRIMARY KEY,',
      ' "weight" VARCHAR,',
      ' "stem" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "customField" INT DEFAULT 13',
      ')',
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
      'CREATE TABLE IF NOT EXISTS content (',
      'contentId TEXT PRIMARY KEY,',
      ' "weight" VARCHAR,',
      ' "stem" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "customField" BOOLEAN DEFAULT false',
      ')',
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
      'CREATE TABLE IF NOT EXISTS content (',
      'contentId TEXT PRIMARY KEY,',
      ' "weight" VARCHAR,',
      ' "stem" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "customField" DATE',
      ')',
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
      'CREATE TABLE IF NOT EXISTS content (',
      'contentId TEXT PRIMARY KEY,',
      ' "weight" VARCHAR,',
      ' "stem" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "customField" TEXT',
      ')',
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
      'CREATE TABLE IF NOT EXISTS content (',
      'contentId TEXT PRIMARY KEY,',
      ' "weight" VARCHAR,',
      ' "stem" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "customField" TEXT',
      ')',
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
      'CREATE TABLE IF NOT EXISTS content (',
      'contentId TEXT PRIMARY KEY,',
      ' "weight" VARCHAR,',
      ' "stem" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "f1" BOOLEAN NULL,',
      ' "f2" VARCHAR NULL,',
      ' "f3" INT NULL,',
      ' "f4" DATE NULL,',
      ' "f5" TEXT NULL,',
      ' "f6" TEXT NULL',
      ')',
    ].join(''))
  })
})
