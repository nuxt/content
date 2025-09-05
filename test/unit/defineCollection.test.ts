import { beforeAll, describe, expect, test } from 'vitest'
import { z } from 'zod'
import { defineCollection } from '../../src/utils/collection'
import { initiateValidatorsContext } from '../../src/utils/dependencies'

const metaFields = ['id', 'stem', 'meta', 'extension']
const pageFields = ['path', 'title', 'description', 'seo', 'body', 'navigation']

function expectProperties(shape: Record<string, unknown>, fields: string[]) {
  fields.forEach(field => expect(shape).toHaveProperty(field))
}

describe('defineCollection', () => {
  beforeAll(async () => {
    await initiateValidatorsContext()
  })

  test('Page without custom schema', () => {
    const collection = defineCollection({
      type: 'page',
      source: 'pages/**',
    })
    expect(collection).toMatchObject({
      type: 'page',
      source: [{
        _resolved: true,
        include: 'pages/**',
        cwd: '',
      }],
    })
    expect(collection.schema.definitions.__SCHEMA__.properties).not.toHaveProperty('title')

    expectProperties(collection.extendedSchema.definitions.__SCHEMA__.properties, metaFields)
    expectProperties(collection.extendedSchema.definitions.__SCHEMA__.properties, pageFields)
  })

  test('Page with custom schema', () => {
    const collection = defineCollection({
      type: 'page',
      source: 'pages/**',
      schema: z.object({
        customField: z.string(),
      }),
    })

    expect(collection.schema.definitions.__SCHEMA__.properties).ownProperty('customField')
    expect(collection.extendedSchema.definitions.__SCHEMA__.properties).toHaveProperty('customField')

    expectProperties(collection.extendedSchema.definitions.__SCHEMA__.properties, metaFields)
    expectProperties(collection.extendedSchema.definitions.__SCHEMA__.properties, pageFields)
  })

  test('Page with object source', () => {
    const collection = defineCollection({
      type: 'page',
      source: {
        include: 'pages/**',
        prefix: 'blog',
        exclude: ['pages/blog/index.md'],
      },
      schema: z.object({
        customField: z.string(),
      }),
    })

    expect(collection).toMatchObject({
      type: 'page',
      source: [{
        include: 'pages/**',
        prefix: 'blog',
        exclude: ['pages/blog/index.md'],
        cwd: '',
      }],
    })

    expect(collection.schema.definitions.__SCHEMA__.properties).ownProperty('customField')
    expect(collection.extendedSchema.definitions.__SCHEMA__.properties).toHaveProperty('customField')

    expectProperties(collection.extendedSchema.definitions.__SCHEMA__.properties, pageFields)
  })

  test('Data with schema', () => {
    const collection = defineCollection({
      type: 'data',
      source: 'data/**',
      schema: z.object({
        customField: z.string(),
      }),
    })

    expect(collection).toMatchObject({
      type: 'data',
      source: [{
        _resolved: true,
        include: 'data/**',
        cwd: '',
      }],
    })

    expect(collection.schema.definitions.__SCHEMA__.properties).toHaveProperty('customField')
    expect(collection.extendedSchema.definitions.__SCHEMA__.properties).toHaveProperty('customField')
    expect(collection.schema.definitions.__SCHEMA__.properties).not.toHaveProperty('title')

    expectProperties(collection.extendedSchema.definitions.__SCHEMA__.properties, metaFields)
  })

  test('Data with object source', () => {
    const collection = defineCollection({
      type: 'data',
      source: {
        include: 'data/**',
        prefix: 'blog',
        exclude: ['data/blog/index.md'],
      },
      schema: z.object({
        customField: z.string(),
      }),
    })

    expect(collection).toMatchObject({
      type: 'data',
      source: [{
        include: 'data/**',
        cwd: '',
        prefix: 'blog',
        exclude: ['data/blog/index.md'],
      }],
    })
  })
})
