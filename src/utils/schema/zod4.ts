import { z as zod } from 'zod/v4'
import type { Draft07, Draft07DefinitionProperty, Draft07DefinitionPropertyAllOf, Draft07DefinitionPropertyAnyOf } from '../../types'

export function toJSONSchema(
  _schema: unknown,
  name: string,
): Draft07 {
  const schema = _schema as zod.ZodSchema
  try {
    const baseSchema = zod.toJSONSchema(schema, {
      target: 'draft-7',
      unrepresentable: 'any',
      override: (ctx) => {
        const def = ctx.zodSchema._zod?.def as unknown as Record<string, unknown>
        if (def?.type === 'date') {
          ctx.jsonSchema.type = 'string'
          ctx.jsonSchema.format = 'date-time'
        }
        if (def?.$content) {
          ctx.jsonSchema.$content = def.$content
        }
      },
    })

    const draft07Schema: Draft07 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: `#/definitions/${name}`,
      definitions: {
        [name]: {
          type: (baseSchema.type as string) || 'object',
          properties:
            (baseSchema.properties as Record<
              string,
              | Draft07DefinitionProperty
              | Draft07DefinitionPropertyAnyOf
              | Draft07DefinitionPropertyAllOf
            >) || {},
          required: (baseSchema.required as string[]) || [],
          additionalProperties:
            typeof baseSchema.additionalProperties === 'boolean'
              ? baseSchema.additionalProperties
              : false,
        },
      },
    }

    return draft07Schema
  }
  catch (error) {
    console.error(
      'Zod toJSONSchema error for schema:',
      schema.constructor.name,
      error,
    )
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: `#/definitions/${name}`,
      definitions: {
        [name]: {
          type: 'object',
          properties: {},
          required: [],
          additionalProperties: false,
        },
      },
    }
  }
}
