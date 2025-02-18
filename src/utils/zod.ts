import type { ZodOptionalDef, ZodType } from 'zod'
import { z as zod } from 'zod'

declare module 'zod' {
  interface ZodTypeDef {
    editor?: EditorOptions
  }

  interface ZodType {
    editor(options: EditorOptions): this
  }
}

interface EditorOptions {
  input?: 'media' | 'icon' // Override the default input for the field
  hidden?: boolean // Do not display the field in the editor
}

export type ZodFieldType = 'ZodString' | 'ZodNumber' | 'ZodBoolean' | 'ZodDate' | 'ZodEnum'
export type SqlFieldType = 'VARCHAR' | 'INT' | 'BOOLEAN' | 'DATE' | 'TEXT'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(zod.ZodType as any).prototype.editor = function (options: EditorOptions) {
  this._def.editor = { ...this._def.editor, ...options }
  return this
}

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
    zodType = (zodType._def as ZodOptionalDef).innerType as ZodType
  }
  return zodType
}

export function getUnderlyingTypeName(zodType: ZodType): string {
  return getUnderlyingType(zodType).constructor.name
}
