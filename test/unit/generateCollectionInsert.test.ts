import { beforeAll, describe, expect, test } from 'vitest'
import { z } from 'zod'
import { generateCollectionInsert, defineCollection, resolveCollection, getTableName, SLICE_SIZE, MAX_SQL_QUERY_SIZE, utf8ByteLength } from '../../src/utils/collection'
import { initiateValidatorsContext } from '../../src/utils/dependencies'

describe('generateCollectionInsert', () => {
  beforeAll(async () => {
    await initiateValidatorsContext()
  })

  test('Respect Schema\'s default values', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'data',
      source: '**',
      schema: z.object({
        customField: z.number().default(13),
        otherField: z.string().default('untitled'),
        otherField2: z.boolean().default(true),
        date: z.date().default(new Date('2022-01-01')),
        dateString: z.string().date().default('2022-01-01'),
        datetimeString: z.string().datetime().default('2022-01-01 20:00:00'),
        object: z.object({ foo: z.string() }).default(() => ({ foo: 'bar' })),
        array: z.array(z.string()).default(() => []),
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
      ' (\'foo.md\', \'[]\', 13, \'2022-01-01\', \'2022-01-01\', \'2022-01-01 20:00:00\', \'md\', \'{}\', \'{"foo":"bar"}\', \'untitled\', true, \'foo\', \'qOlPCMRxWbrtFhHMqkJLriaEnrze1H-G48FLCfDo13M\');',
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
        object: z.object({ foo: z.string() }).default(() => ({ foo: 'bar' })),
        array: z.array(z.string()).default(() => []),
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
      object: { foo: 'baz' },
      array: ['foo'],
    })

    expect(sql[0]).toBe([
      `INSERT INTO ${getTableName('content')}`,
      ' VALUES',
      ' (\'foo.md\', \'["foo"]\', 42, \'2022-01-02\', \'md\', \'{}\', \'{"foo":"baz"}\', \'foo\', false, \'foo\', \'uppo29zBKkTDGdRbmj29XkaEcWcpEnA1UYLgajzyWw0\');',
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
    const sliceIndexes = [SLICE_SIZE]
    for (let i = 1; i < (content.length / SLICE_SIZE); i++) {
      querySlices.push(content.slice((SLICE_SIZE * i) - 1, (SLICE_SIZE * (i + 1)) - 1))
      sliceIndexes.push(SLICE_SIZE * (i + 1))
    }

    // check that the content will be split into multiple queries
    expect(content.length).toBeGreaterThan(MAX_SQL_QUERY_SIZE)

    // check that concatenated all the values are equal to the original content
    expect(content).toEqual(querySlices.join(''))

    const hash = 'QMyFxMru9gVfaNx0fzjs5is7SvAZMEy3tNDANjkdogg'

    expect(sql[0]).toBe([
      `INSERT INTO ${getTableName('content')}`,
      ' VALUES',
      ` ('foo.md', '${querySlices[0]}', 'md', '{}', 'foo', '${hash}-${sliceIndexes[0]}');`,
    ].join(''))
    let index = 1

    while (index < sql.length) {
      // last statement should update the hash column to the hash itself
      const nextHash = index === sql.length - 1 ? hash : `${hash}-${sliceIndexes[index]}`
      expect(sql[index]).toBe([
        `UPDATE ${getTableName('content')}`,
        ' SET',
        ` content = CONCAT(content, '${querySlices[index]}')`,
        `, "__hash__" = '${nextHash}'`,
        ' WHERE id = \'foo.md\'',
        ` AND "__hash__" = '${hash}-${sliceIndexes[index - 1]}';`,
      ].join(''))
      index++
    }
  })

  test('Split multibyte (UTF-8) values that exceed byte limit', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'data',
      source: '**',
      schema: z.object({
        content: z.string(),
      }),
    }))!

    // '心' is 3 bytes in UTF-8. 35000 chars = 105000 bytes > MAX_SQL_QUERY_SIZE (100000)
    const content = '心'.repeat(35000)

    const { queries: sql } = generateCollectionInsert(collection, {
      id: 'multibyte.md',
      stem: 'multibyte',
      extension: 'md',
      meta: {},
      content,
    })

    // Must be split into multiple queries
    expect(sql.length).toBeGreaterThan(1)

    // Each query must fit within the byte limit
    for (const query of sql) {
      expect(utf8ByteLength(query)).toBeLessThan(MAX_SQL_QUERY_SIZE)
    }

    // First query should be INSERT, subsequent should be UPDATE
    expect(sql[0]).toContain('INSERT INTO')
    for (let i = 1; i < sql.length; i++) {
      expect(sql[i]).toContain('UPDATE')
    }

    // Reconstruct the content from all queries and verify it matches the original
    const insertMatch = sql[0]!.match(/'(心+)'/)
    let reconstructed = insertMatch![1]!
    for (let i = 1; i < sql.length; i++) {
      const updateMatch = sql[i]!.match(/CONCAT\(content, '(心+)'\)/)
      reconstructed += updateMatch![1]!
    }
    expect(reconstructed).toBe(content)
  })

  test('Succeed when SLICE_SIZE byte boundary falls on an emoji', () => {
    const collection = resolveCollection('content', defineCollection({
      type: 'data',
      source: '**',
      schema: z.object({
        content: z.string(),
      }),
    }))!

    // 'a' (1 byte) shifts alignment so that the SLICE_SIZE byte boundary
    // falls in the middle of a '😀' (4 bytes in UTF-8)
    // biggestColumn = "'a😀😀...😀'" → byte 0: quote(1), byte 1: 'a'(1), bytes 2+: emojis(4 each)
    // Byte at SLICE_SIZE (70000) = 2 + 4*17499.5 → falls inside the 17500th emoji
    const content = 'a' + '😀'.repeat(25000)

    const { queries: sql } = generateCollectionInsert(collection, {
      id: 'emoji-boundary.md',
      stem: 'emoji-boundary',
      extension: 'md',
      meta: {},
      content,
    })

    // Must be split into multiple queries
    expect(sql.length).toBeGreaterThan(1)

    // Each query must fit within the byte limit
    for (const query of sql) {
      expect(utf8ByteLength(query)).toBeLessThan(MAX_SQL_QUERY_SIZE)
    }

    // First query should be INSERT, subsequent should be UPDATE
    expect(sql[0]).toContain('INSERT INTO')
    for (let i = 1; i < sql.length; i++) {
      expect(sql[i]).toContain('UPDATE')
    }

    // Reconstruct the content from all queries and verify no emoji was split
    const insertMatch = sql[0]!.match(/'(a(?:😀)+)'/)
    expect(insertMatch).not.toBeNull()
    let reconstructed = insertMatch![1]!
    for (let i = 1; i < sql.length; i++) {
      const updateMatch = sql[i]!.match(/CONCAT\(content, '((?:😀)+)'\)/)
      expect(updateMatch).not.toBeNull()
      reconstructed += updateMatch![1]!
    }
    expect(reconstructed).toBe(content)
  })
})
