import type { ZodRawShape } from 'zod'

export function getOrderedSchemaKeys(shape: ZodRawShape) {
  const keys = new Set([
    shape.id ? 'id' : undefined,
    shape.title ? 'title' : undefined,
    ...Object.keys(shape).sort(),
  ].filter(Boolean))

  return Array.from(keys) as string[]
}
