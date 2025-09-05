import { beforeAll, describe, expect, test } from 'vitest'
import { z } from 'zod'
import { generateCollectionTableDefinition, defineCollection, resolveCollection, getTableName } from '../../src/utils/collection'
import { initiateValidatorsContext } from '../../src/utils/dependencies'

describe('generateCollectionTableDefinition', () => {
  beforeAll(async () => {
    await initiateValidatorsContext()
  })

  test('Page without custom schema', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'page',
      source: 'pages/**',
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'id TEXT PRIMARY KEY,',
      ' "title" VARCHAR,',
      ' "body" TEXT,',
      ' "description" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "navigation" TEXT DEFAULT true,',
      ' "path" VARCHAR,',
      ' "seo" TEXT DEFAULT \'{}\',',
      ' "stem" VARCHAR,',
      ' "__hash__" TEXT UNIQUE',
      ');',
    ].join(''))
  })

  test('Page with custom schema', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'page',
      source: 'pages/**',
      schema: z.object({
        customField: z.string(),
      }),
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'id TEXT PRIMARY KEY,',
      ' "title" VARCHAR,',
      ' "body" TEXT,',
      ' "customField" VARCHAR,',
      ' "description" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "navigation" TEXT DEFAULT true,',
      ' "path" VARCHAR,',
      ' "seo" TEXT DEFAULT \'{}\',',
      ' "stem" VARCHAR,',
      ' "__hash__" TEXT UNIQUE',
      ');',
    ].join(''))
  })

  test('Data with schema', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.string(),
      }),
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'id TEXT PRIMARY KEY,',
      ' "customField" VARCHAR,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR,',
      ' "__hash__" TEXT UNIQUE',
      ');',
    ].join(''))
  })

  // Columns
  test('String with max length', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.string().max(64).default('foo'),
      }),
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'id TEXT PRIMARY KEY,',
      ' "customField" VARCHAR(64) DEFAULT \'foo\',',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR,',
      ' "__hash__" TEXT UNIQUE',
      ');',
    ].join(''))
  })

  test('Number', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.number().default(13),
      }),
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'id TEXT PRIMARY KEY,',
      ' "customField" INT DEFAULT 13,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR,',
      ' "__hash__" TEXT UNIQUE',
      ');',
    ].join(''))
  })

  test('Boolean', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.boolean().default(false),
      }),
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'id TEXT PRIMARY KEY,',
      ' "customField" BOOLEAN DEFAULT false,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR,',
      ' "__hash__" TEXT UNIQUE',
      ');',
    ].join(''))
  })

  test('Date', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.date(),
      }),
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'id TEXT PRIMARY KEY,',
      ' "customField" DATE,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR,',
      ' "__hash__" TEXT UNIQUE',
      ');',
    ].join(''))
  })

  test('Object', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.object({
          f1: z.boolean(),
          f2: z.string(),
        }),
      }),
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'id TEXT PRIMARY KEY,',
      ' "customField" TEXT,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR,',
      ' "__hash__" TEXT UNIQUE',
      ');',
    ].join(''))
  })

  test('Array', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.array(z.object({
          f1: z.boolean(),
          f2: z.string(),
        })),
      }),
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'id TEXT PRIMARY KEY,',
      ' "customField" TEXT,',
      ' "extension" VARCHAR,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR,',
      ' "__hash__" TEXT UNIQUE',
      ');',
    ].join(''))
  })

  test('Nullable', () => {
    const collection = resolveCollection('content', defineCollection({
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
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toBe([
      `CREATE TABLE IF NOT EXISTS ${getTableName('content')} (`,
      'id TEXT PRIMARY KEY,',
      ' "extension" VARCHAR,',
      ' "f1" BOOLEAN NULL,',
      ' "f2" VARCHAR NULL,',
      ' "f3" INT NULL,',
      ' "f4" DATE NULL,',
      ' "f5" TEXT NULL,',
      ' "f6" TEXT NULL,',
      ' "meta" TEXT,',
      ' "stem" VARCHAR,',
      ' "__hash__" TEXT UNIQUE',
      ');',
    ].join(''))
  })
})
