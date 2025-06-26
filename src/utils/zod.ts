import type { ZodOptionalDef, ZodType } from 'zod'
import { zodToJsonSchema, ignoreOverride } from 'zod-to-json-schema'
import { z as zod } from 'zod'
import { createDefu } from 'defu'
import type { Draft07, EditorOptions } from '../types'

const defu = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    obj[key] = value
    return true
  }
})

declare module 'zod' {
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
  this._def.editor = { ...this._def.editor, ...options }
  return this
}

export const z = zod

// Function to get the underlying Zod type
export function getUnderlyingType(zodType: ZodType): ZodType {
  while ((zodType._def as ZodOptionalDef).innerType) {
    zodType = (zodType._def as ZodOptionalDef).innerType as ZodType
  }
  return zodType
}

export function getUnderlyingTypeName(zodType: ZodType): string {
  return getUnderlyingType(zodType).constructor.name
}

export function zodToStandardSchema(schema: zod.ZodSchema, name: string): Draft07 {
  const jsonSchema = zodToJsonSchema(schema, { name, $refStrategy: 'none' }) as Draft07
  const jsonSchemaWithEditorMeta = zodToJsonSchema(
    schema,
    {
      name,
      $refStrategy: 'none',
      override: (def) => {
        if (def.editor) {
          return {
            $content: {
              editor: def.editor,
            },
          } as never
        }

        return ignoreOverride
      },
    }) as Draft07

  return defu(jsonSchema, jsonSchemaWithEditorMeta)
}
