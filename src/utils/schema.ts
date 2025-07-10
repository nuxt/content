import * as z from 'zod'
import { ContentFileExtension } from '../types/content'
import type { Draft07, Draft07Definition, Draft07DefinitionProperty } from '../types'
import { resolveModule, useNuxt } from '@nuxt/kit'
import { getComponentMeta } from 'nuxt-component-meta/parser'
import { propsToJsonSchema } from 'nuxt-component-meta/utils'

export function getEnumValues<T extends Record<string, unknown>>(obj: T) {
  return Object.values(obj) as [(typeof obj)[keyof T]]
}

export const metaSchema = z.object({
  id: z.string(),
  stem: z.string(),
  extension: z.enum(getEnumValues(ContentFileExtension)),
  meta: z.record(z.string(), z.any()),
})

export const emptyStandardSchema: Draft07 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $ref: '#/definitions/__SCHEMA__',
  definitions: {
    __SCHEMA__: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
}

export const metaStandardSchema: Draft07 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $ref: '#/definitions/__SCHEMA__',
  definitions: {
    __SCHEMA__: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        stem: {
          type: 'string',
        },
        extension: {
          type: 'string',
          enum: [
            'md',
            'yaml',
            'yml',
            'json',
            'csv',
            'xml',
          ],
        },
        meta: {
          type: 'object',
          additionalProperties: {},
        },
      },
      required: [
        'id',
        'stem',
        'extension',
        'meta',
      ],
      additionalProperties: false,
    },
  },
}
export const pageSchema = z.object({
  path: z.string(),
  title: z.string(),
  description: z.string(),
  seo: z.intersection(
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    }),
    z.record(z.string(), z.any()),
  ).optional().default({}),
  body: z.object({
    type: z.string(),
    children: z.any(),
    toc: z.any(),
  }),
  navigation: z.union([
    z.boolean(),
    z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string(),
    }),
  ]).optional().default(true),
})

export const pageStandardSchema: Draft07 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $ref: '#/definitions/__SCHEMA__',
  definitions: {
    __SCHEMA__: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        seo: {
          allOf: [
            {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
              },
            },
            {
              type: 'object',
              additionalProperties: {},
            },
          ],
          default: {},
        },
        body: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
            },
            children: {},
            toc: {},
          },
          required: [
            'type',
          ],
          additionalProperties: false,
        },
        navigation: {
          anyOf: [
            {
              type: 'boolean',
            },
            {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
                icon: {
                  type: 'string',
                  $content: {
                    editor: {
                      input: 'icon',
                    },
                  },
                },
              },
              required: [
                'title',
                'description',
                'icon',
              ],
              additionalProperties: false,
            },
          ],
          default: true,
        },
      },
      required: [
        'path',
        'title',
        'description',
        'body',
      ],
      additionalProperties: false,
    },
  },
}

export function mergeStandardSchema(s1: Draft07, s2: Draft07): Draft07 {
  return {
    $schema: s1.$schema,
    $ref: s1.$ref,
    definitions: Object.fromEntries(
      Object.entries(s1.definitions).map(([key, def1]) => {
        const def2 = s2.definitions[key]
        if (!def2) return [key, def1]

        return [key, {
          ...def1,
          properties: { ...def1.properties, ...def2.properties },
          required: [...new Set([...def1.required, ...(def2.required || [])])],
        }]
      }),
    ),
  }
}

export function replaceComponentSchemas<T extends Draft07Definition | Draft07DefinitionProperty>(property: T): T {
  if (property.type !== 'object') {
    return property
  }

  // If the property has a _inherit property, replace it with the component's props schema
  if (property.properties?._inherit) {
    const nuxt = useNuxt()
    let path = String((property.properties._inherit as Draft07DefinitionProperty).default)
    try {
      path = resolveModule(path)
    }
    catch {
      // Ignore error
    }

    const meta = getComponentMeta(path, { rootDir: nuxt.options.rootDir })
    return propsToJsonSchema(meta.props) as T
  }

  // Look for _inherit properties in nested objects
  if (property.properties) {
    Object.entries(property.properties).forEach(([key, value]) => {
      property.properties![key] = replaceComponentSchemas(value as Draft07DefinitionProperty) as Draft07DefinitionProperty
    })
  }

  return property
}
