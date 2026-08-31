import { zodToJsonSchema, ignoreOverride } from 'zod-to-json-schema'
import type { ZodSchema } from 'zod'
import { createDefu } from 'defu'
import type { Draft07 } from '../../types'

const defu = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    obj[key] = value
    return true
  }
})

export function toJSONSchema(_schema: unknown, name: string): Draft07 {
  const schema = _schema as ZodSchema
  const jsonSchema = zodToJsonSchema(schema, { name, $refStrategy: 'none', dateStrategy: 'format:date' }) as Draft07
  const jsonSchemaWithEditorMeta = zodToJsonSchema(
    schema,
    {
      name,
      $refStrategy: 'none',
      dateStrategy: 'format:date',
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
