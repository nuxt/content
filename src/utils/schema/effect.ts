import { JSONSchema } from 'effect'
import type { Draft07, Draft07Definition } from '../../types'

export function toJSONSchema(schema: unknown, name: string): Draft07 {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const definitions = JSONSchema.make(schema as any, {
    target: 'jsonSchema7',
  }) as Draft07Definition

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $ref: `#/definitions/${name}`,
    definitions: {
      [name]: definitions,
    },
  }
}
