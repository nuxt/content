import { printNode, zodToTs } from 'zod-to-ts'
import type { ZodObject, ZodRawShape } from 'zod'
import type { ResolvedCollection } from '../types/collection'

export function contentTypesTemplate({ options }: { options: { collections: ResolvedCollection[] } }) {
  return [
    ...options.collections.map(c => `export type ${c.pascalName} = ${printNode(zodToTs(c.schema as ZodObject<ZodRawShape>, c.pascalName).node)}`),
    'interface Collections {',
    ...options.collections.map(c => `  ${c.name}: ${c.pascalName}`),
    '}',
    '',
    'declare module \'@farnabaz/content-next\' {',
    '  interface Collections {',
    ...options.collections.map(c => `    ${c.name}: ${c.pascalName}`),
    '  }',
    '}',
    'interface QueryBuilder<T> {',
    '  path(path: string): QueryBuilder<T>',
    '  skip(skip: number): QueryBuilder<T>',
    '  limit(limit: number): QueryBuilder<T>',
    '  all(): Promise<T[]>',
    '  first(): Promise<T>',
    '}',
    '',
    'declare global {',
    '  const queryContents: <T extends keyof Collections>(collection: T) => QueryBuilder<T>',
    '}',
  ].join('\n')
}

export function collectionsTemplate({ options }: { options: { collections: ResolvedCollection[] } }) {
  return 'export const collections = ' + JSON.stringify(options.collections.map(c => ({
    name: c.name,
    pascalName: c.pascalName,
    jsonFields: c.jsonFields,
  })), null, 2)
}
