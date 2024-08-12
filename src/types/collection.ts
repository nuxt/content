import type { ZodObject, ZodRawShape } from 'zod'

export interface Collections {
}

type CollectionType = 'page' | 'data'

export interface Collection<T extends ZodRawShape = ZodRawShape> {
  type: CollectionType
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
  type: CollectionType
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

export interface CollectionInfo {
  name: string
  pascalName: string
  jsonFields: string[]
  type: CollectionType
}
