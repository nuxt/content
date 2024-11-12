import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { defineCollection } from '../../src/utils/collection'

const metaFields = ['id', 'stem', 'meta', 'extension']
const pageFields = ['path', 'title', 'description', 'seo', 'body', 'navigation']

function expectProperties(shape: z.ZodRawShape, fields: string[]) {
  fields.forEach(field => expect(shape).toHaveProperty(field))
}

describe('defineCollection', () => {
  test('Page without custom schema', () => {
    const collection = defineCollection({
      type: 'page',
      source: 'pages/**',
    })
    expect(collection).toMatchObject({
      type: 'page',
      source: {
        _resolved: true,
        include: '**',
        cwd: '~~/content/pages',
      },
    })

    expect(collection.schema.shape).not.ownProperty('title')

    expectProperties(collection.extendedSchema.shape, metaFields)
    expectProperties(collection.extendedSchema.shape, pageFields)
  })

  test('Page with custom schema', () => {
    const collection = defineCollection({
      type: 'page',
      source: 'pages/**',
      schema: z.object({
        customField: z.string(),
      }),
    })

    expect(collection.schema.shape).ownProperty('customField')
    expect(collection.extendedSchema.shape).toHaveProperty('customField')

    expectProperties(collection.extendedSchema.shape, metaFields)
    expectProperties(collection.extendedSchema.shape, pageFields)
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
      source: {
        include: '**',
        prefix: 'blog',
        exclude: ['pages/blog/index.md'],
        cwd: '~~/content/pages',
      },
    })

    expect(collection.schema.shape).ownProperty('customField')
    expect(collection.extendedSchema.shape).toHaveProperty('customField')

    expectProperties(collection.extendedSchema.shape, pageFields)
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
      source: {
        _resolved: true,
        include: '**',
        cwd: '~~/content/data',
      },
    })

    expect(collection.schema.shape).toHaveProperty('customField')
    expect(collection.extendedSchema.shape).toHaveProperty('customField')
    expect(collection.schema.shape).not.toHaveProperty('title')

    expectProperties(collection.extendedSchema.shape, metaFields)
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
      source: {
        include: '**',
        cwd: '~~/content/data',
        prefix: 'blog',
        exclude: ['data/blog/index.md'],
      },
    })
  })
})
