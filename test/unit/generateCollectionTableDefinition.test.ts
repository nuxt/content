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

  // Indexes
  test('Single column index', () => {
    const collection = resolveCollection('posts', defineCollection({
      type: 'page',
      source: 'blog/**',
      schema: z.object({
        author: z.string(),
      }),
      indexes: [
        { columns: ['author'] },
      ],
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_posts_author ON _content_posts ("author");')
  })

  test('Multiple single column indexes', () => {
    const collection = resolveCollection('posts', defineCollection({
      type: 'page',
      source: 'blog/**',
      schema: z.object({
        author: z.string(),
        category: z.string(),
      }),
      indexes: [
        { columns: ['author'] },
        { columns: ['category'] },
      ],
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_posts_author ON _content_posts ("author");')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_posts_category ON _content_posts ("category");')
  })

  test('Composite index', () => {
    const collection = resolveCollection('posts', defineCollection({
      type: 'page',
      source: 'blog/**',
      schema: z.object({
        category: z.string(),
        publishedAt: z.date(),
      }),
      indexes: [
        { columns: ['category', 'publishedAt'] },
      ],
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_posts_category_publishedAt ON _content_posts ("category", "publishedAt");')
  })

  test('Unique index', () => {
    const collection = resolveCollection('posts', defineCollection({
      type: 'page',
      source: 'blog/**',
      schema: z.object({
        slug: z.string(),
      }),
      indexes: [
        { columns: ['slug'], unique: true },
      ],
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toContain('CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON _content_posts ("slug");')
  })

  test('Custom index name', () => {
    const collection = resolveCollection('posts', defineCollection({
      type: 'page',
      source: 'blog/**',
      schema: z.object({
        author: z.string(),
        publishedAt: z.date(),
      }),
      indexes: [
        { columns: ['author', 'publishedAt'], name: 'idx_custom_author_date' },
      ],
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_custom_author_date ON _content_posts ("author", "publishedAt");')
  })

  test('Index on id column', () => {
    const collection = resolveCollection('posts', defineCollection({
      type: 'page',
      source: 'blog/**',
      indexes: [
        { columns: ['id'] },
      ],
    }))!
    const sql = generateCollectionTableDefinition(collection)

    // Should create index without warning (id is always valid)
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_posts_id ON _content_posts ("id");')
  })

  test('No indexes defined', () => {
    const collection = resolveCollection('posts', defineCollection({
      type: 'page',
      source: 'blog/**',
      schema: z.object({
        author: z.string(),
      }),
    }))!
    const sql = generateCollectionTableDefinition(collection)

    // Should not contain any CREATE INDEX statements
    expect(sql).not.toContain('CREATE INDEX')
  })

  test('Empty indexes array', () => {
    const collection = resolveCollection('posts', defineCollection({
      type: 'page',
      source: 'blog/**',
      schema: z.object({
        author: z.string(),
      }),
      indexes: [],
    }))!
    const sql = generateCollectionTableDefinition(collection)

    // Should not contain any CREATE INDEX statements
    expect(sql).not.toContain('CREATE INDEX')
  })

  test('Long index name truncation', () => {
    const collection = resolveCollection('very_long_collection_name_that_exceeds_limits', defineCollection({
      type: 'page',
      source: 'blog/**',
      schema: z.object({
        very_long_field_name_first: z.string(),
        very_long_field_name_second: z.string(),
        very_long_field_name_third: z.string(),
      }),
      indexes: [
        { columns: ['very_long_field_name_first', 'very_long_field_name_second', 'very_long_field_name_third'] },
      ],
    }))!
    const sql = generateCollectionTableDefinition(collection)

    // Should contain an index with a truncated name (max 63 chars for PostgreSQL)
    const indexMatch = sql.match(/CREATE INDEX IF NOT EXISTS (\S+) ON/)
    expect(indexMatch).toBeTruthy()
    expect(indexMatch![1]!.length).toBeLessThanOrEqual(63)
  })

  test('Multiple indexes with composite and unique', () => {
    const collection = resolveCollection('products', defineCollection({
      type: 'data',
      source: 'products/**',
      schema: z.object({
        sku: z.string(),
        price: z.number(),
        inStock: z.boolean(),
        category: z.string(),
      }),
      indexes: [
        { columns: ['sku'], unique: true },
        { columns: ['price'] },
        { columns: ['category', 'price'] },
        { columns: ['inStock', 'category'] },
      ],
    }))!
    const sql = generateCollectionTableDefinition(collection)

    expect(sql).toContain('CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON _content_products ("sku");')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_products_price ON _content_products ("price");')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_products_category_price ON _content_products ("category", "price");')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_products_inStock_category ON _content_products ("inStock", "category");')
  })
})
