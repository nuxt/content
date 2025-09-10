import { zodToJsonSchema, ignoreOverride } from 'zod-to-json-schema'
import { z as zod } from 'zod'
import { createDefu } from 'defu'
import type { Draft07, EditorOptions } from '../../types'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(zod.ZodType as any).prototype.editor = function (options: EditorOptions) {
  this._def.editor = { ...this._def.editor, ...options }
  return this
}

export const z = zod

export function toJSONSchema(_schema: unknown, name: string): Draft07 {
  const schema = _schema as zod.ZodSchema
  const jsonSchema = zodToJsonSchema(schema, { name, $refStrategy: 'none' }) as Draft07
  const jsonSchemaWithEditorMeta = zodToJsonSchema(
    schema,
    {
      name,
      $refStrategy: 'none',
      override: (_def) => {
        const def = _def as unknown as Record<string, unknown>
        if (def.editor) {
          return {
            $content: {
              editor: def.editor,
            },
          } as never
        }
        if (def.$content) {
          return {
            $content: def.$content,
          } as never
        }

        return ignoreOverride
      },
    }) as Draft07

  return defu(jsonSchema, jsonSchemaWithEditorMeta)
}
