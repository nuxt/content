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
  interface GlobalMeta {
    editor?: EditorOptions
  }
}

export type ZodFieldType
  = | 'ZodString'
    | 'ZodNumber'
    | 'ZodBoolean'
    | 'ZodDate'
    | 'ZodEnum'
export type SqlFieldType = 'VARCHAR' | 'INT' | 'BOOLEAN' | 'DATE' | 'TEXT'

// Loose helper type to silence any usage only at this augmentation point.
// We intentionally keep it minimal to avoid leaking `any` elsewhere.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZodAny = any

;(zod.ZodType as unknown as { prototype: ZodAny }).prototype.editor = function (this: ZodAny, options: EditorOptions) {
  const currentMeta = this.meta() || {}
  const currentEditor = (currentMeta as { editor?: EditorOptions }).editor || {}

  const newMeta = {
    ...currentMeta,
    editor: { ...currentEditor, ...options },
  }

  return this.meta(newMeta) as unknown as ZodType
}

export const z = zod

export function getEditorOptions(schema: ZodType): EditorOptions | undefined {
  const meta = schema.meta()
  return meta ? (meta as { editor?: EditorOptions }).editor : undefined
}

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
