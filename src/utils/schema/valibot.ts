import { toJsonSchema as valibotToJsonSchema } from '@valibot/to-json-schema'
import type { Draft07, Draft07Definition } from '../../types'

export function toJSONSchema(schema: unknown, name: string): Draft07 {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const definitions = valibotToJsonSchema(schema as any, {
    overrideSchema(context) {
      if (context.valibotSchema.type === 'date') {
        return { type: 'string', format: 'date-time' }
      }
      if ((context.valibotSchema as unknown as { $content: Record<string, unknown> }).$content) {
        return {
          ...context.jsonSchema,
          $content: (context.valibotSchema as unknown as { $content: Record<string, unknown> }).$content,
        }
      }
    },
  }) as Draft07Definition

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $ref: `#/definitions/${name}`,
    definitions: {
      [name]: definitions,
    },
  }
}
