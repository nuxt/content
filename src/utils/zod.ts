import type { ZodType } from 'zod/v4/core'
import { z as zod } from 'zod/v4/core'
import type { Draft07, EditorOptions, Draft07DefinitionProperty, Draft07DefinitionPropertyAnyOf, Draft07DefinitionPropertyAllOf } from '../types'

interface JSONSchemaProperty {
  type?: string
  format?: string
  anyOf?: JSONSchemaProperty[]
  default?: unknown
  [key: string]: unknown
}

declare module 'zod/v4/core' {
  interface ZodTypeDef {
    editor?: EditorOptions
  }

  interface ZodType {
    editor(options: EditorOptions): this
  }
}

export type ZodFieldType = 'ZodString' | 'ZodNumber' | 'ZodBoolean' | 'ZodDate' | 'ZodEnum'
export type SqlFieldType = 'VARCHAR' | 'INT' | 'BOOLEAN' | 'DATE' | 'TEXT'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(zod.ZodType as any).prototype.editor = function (options: EditorOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentEditor = (this as any)._def?.editor || {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(this as any)._def = { ...(this as any)._def, editor: { ...currentEditor, ...options } }
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

export function zodToStandardSchema(schema: zod.ZodSchema, name: string): Draft07 {
  try {
    const baseSchema = zod.toJSONSchema(schema, {
      target: 'draft-7',
      unrepresentable: 'any',
    })

    const processedProperties = processPropertiesForZodV4(schema, baseSchema.properties || {})

    const fixedRequired = fixRequiredArrayForNullableFields(baseSchema.required || [], processedProperties)
    const draft07Schema: Draft07 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: `#/definitions/${name}`,
      definitions: {
        [name]: {
          type: baseSchema.type as string || 'object',
          properties: processedProperties,
          required: fixedRequired,
          additionalProperties: typeof baseSchema.additionalProperties === 'boolean' ? baseSchema.additionalProperties : false,
        },
      },
    }

    return draft07Schema
  }
  catch (error) {
    console.error('Zod toJSONSchema error for schema:', schema.constructor.name, error)
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

function processPropertiesForZodV4(schema: zod.ZodSchema, properties: Record<string, unknown>): Record<string, Draft07DefinitionProperty | Draft07DefinitionPropertyAnyOf | Draft07DefinitionPropertyAllOf> {
  const processed: Record<string, Draft07DefinitionProperty | Draft07DefinitionPropertyAnyOf | Draft07DefinitionPropertyAllOf> = {}

  if (schema instanceof zod.ZodObject) {
    const shape = schema.shape

    for (const [key, value] of Object.entries(properties)) {
      const zodField = shape[key] as zod.ZodType
      processed[key] = processProperty(zodField, value as JSONSchemaProperty)
    }
  }
  else {
    for (const [key, value] of Object.entries(properties)) {
      processed[key] = value as Draft07DefinitionProperty
    }
  }

  return processed
}

function fixRequiredArrayForNullableFields(required: string[], properties: Record<string, Draft07DefinitionProperty | Draft07DefinitionPropertyAnyOf | Draft07DefinitionPropertyAllOf>): string[] {
  const fixedRequired: string[] = []

  for (const fieldName of required) {
    const property = properties[fieldName]

    const isNullable = property && 'anyOf' in property
      && Array.isArray(property.anyOf)
      && property.anyOf.some((item: Draft07DefinitionProperty) =>
        typeof item === 'object' && item !== null && 'type' in item && item.type === 'null',
      )

    if (!isNullable) {
      fixedRequired.push(fieldName)
    }
  }

  return fixedRequired
}

function processProperty(zodType: zod.ZodType, property: JSONSchemaProperty): Draft07DefinitionProperty | Draft07DefinitionPropertyAnyOf | Draft07DefinitionPropertyAllOf {
  const underlyingType = getUnderlyingType(zodType)
  const typeName = getUnderlyingTypeName(underlyingType)

  const isNullable = zodType.constructor.name === 'ZodNullable'

  if (property.anyOf && Array.isArray(property.anyOf)) {
    const hasNull = property.anyOf.some((item: JSONSchemaProperty) => item.type === 'null')
    if (hasNull && typeName === 'ZodDate') {
      const nonNullItems = property.anyOf.filter((item: JSONSchemaProperty) => item.type !== 'null')
      if (nonNullItems.length === 1 && Object.keys(nonNullItems[0]).length === 0) {
        return {
          anyOf: [
            { type: 'string', format: 'date-time' },
            { type: 'null' },
          ],
        } as Draft07DefinitionPropertyAnyOf
      }
    }
  }

  if (typeName === 'ZodDate' && (!property.type || Object.keys(property).length === 0 || (Object.keys(property).length === 1 && 'default' in property))) {
    if (isNullable) {
      return {
        anyOf: [
          { type: 'string', format: 'date-time' },
          { type: 'null' },
        ],
      } as Draft07DefinitionPropertyAnyOf
    }

    const result: Draft07DefinitionProperty = {
      type: 'string',
      format: 'date-time',
    }

    if ('default' in property) {
      result.default = property.default
    }

    return result
  }

  return property as Draft07DefinitionProperty
}
