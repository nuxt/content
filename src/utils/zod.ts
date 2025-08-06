import type { ZodType } from 'zod/v4'
import { z as zod } from 'zod/v4'
import type {
  Draft07,
  EditorOptions,
  Draft07DefinitionProperty,
  Draft07DefinitionPropertyAnyOf,
  Draft07DefinitionPropertyAllOf,
} from '../types'

declare module 'zod/v4' {
  interface ZodTypeDef {
    editor?: EditorOptions
  }

  interface ZodType {
    editor(options: EditorOptions): this
  }
}

export type ZodFieldType
  = | 'ZodString'
    | 'ZodNumber'
    | 'ZodBoolean'
    | 'ZodDate'
    | 'ZodEnum'
export type SqlFieldType = 'VARCHAR' | 'INT' | 'BOOLEAN' | 'DATE' | 'TEXT';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(zod.ZodType as any).prototype.editor = function (options: EditorOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentEditor = (this as any)._def?.editor || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (this as any)._def = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(this as any)._def,
    editor: { ...currentEditor, ...options },
  }
  return this
}

export const z = zod

// Function to get the underlying Zod type
export function getUnderlyingType(zodType: ZodType): ZodType {
  let currentType = zodType
  while (
    currentType.constructor.name === 'ZodOptional'
    || currentType.constructor.name === 'ZodNullable'
    || currentType.constructor.name === 'ZodDefault'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentType = (currentType as any)._def.innerType as ZodType
  }
  return currentType
}

export function getUnderlyingTypeName(zodType: ZodType): string {
  return getUnderlyingType(zodType).constructor.name
}

export function zodToStandardSchema(
  schema: zod.ZodSchema,
  name: string,
): Draft07 {
  try {
    const baseSchema = zod.toJSONSchema(schema, {
      target: 'draft-7',
      unrepresentable: 'any',
      override: (ctx) => {
        const def = ctx.zodSchema._zod?.def
        if (def?.type === 'date') {
          ctx.jsonSchema.type = 'string'
          ctx.jsonSchema.format = 'date-time'
        }
      },
    })

    const fixedRequired = fixRequiredArrayForNullableFields(
      baseSchema.required || [],
      baseSchema.properties || {},
    )

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
          required: fixedRequired,
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

function fixRequiredArrayForNullableFields(
  required: string[],
  properties: Record<string, unknown>,
): string[] {
  return required.filter((fieldName) => {
    const property = properties[fieldName]

    const isNullable
      = property
        && typeof property === 'object'
        && property !== null
        && 'anyOf' in property
        && Array.isArray(property.anyOf)
        && property.anyOf.some(
          (item: unknown) =>
            typeof item === 'object'
            && item !== null
            && 'type' in item
            && item.type === 'null',
        )

    return !isNullable
  })
}
