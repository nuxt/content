import type { ZodObject, ZodRawShape } from 'zod'

export interface Collection<T extends ZodRawShape = ZodRawShape> {
  type: 'page' | 'data'
  source: {
    name: string
    driver: 'fs'
    base: string
  }
  schema: ZodObject<T>
}

export interface ResolvedCollection<T extends ZodRawShape = ZodRawShape> {
  name: string
  pascalName: string
  type: 'page' | 'data'
  source: Collection<T>['source']
  schema: ZodObject<T>
  table: string
  generatedFields: {
    raw: boolean
    body: boolean
    path: boolean
  }
  jsonFields: string[]
}
