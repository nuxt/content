import type { ZodType, ZodOptionalDef } from 'zod'
import { z as zod } from 'zod'

export type ZodFieldType = 'ZodString' | 'ZodNumber' | 'ZodBoolean' | 'ZodDate' | 'ZodEnum'
export type SqlFieldType = 'VARCHAR' | 'INT' | 'BOOLEAN' | 'DATE' | 'TEXT'

export const z = zod

export const ZodToSqlFieldTypes: Record<ZodFieldType, SqlFieldType> = {
  ZodString: 'VARCHAR',
  ZodNumber: 'INT',
  ZodBoolean: 'BOOLEAN',
  ZodDate: 'DATE',
  ZodEnum: 'VARCHAR',
} as const

export function getEnumValues<T extends Record<string, unknown>>(obj: T) {
  return Object.values(obj) as [(typeof obj)[keyof T]]
}

// Function to get the underlying Zod type
export function getUnderlyingType(zodType: ZodType): ZodType {
  while ((zodType._def as ZodOptionalDef).innerType) {
    zodType = (zodType._def as ZodOptionalDef).innerType
  }
  return zodType
}
