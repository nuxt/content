import { printNode, zodToTs } from 'zod-to-ts'
import type { ZodObject, ZodRawShape } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type { ResolvedCollection } from '../types/collection'

export function contentTypesTemplate({ options }: { options: { collections: ResolvedCollection[] } }) {
  return [
    'import type { CollectionQueryBuilder } from \'@farnabaz/content-next\'',
    ...options.collections.map(c => `export type ${c.pascalName} = ${printNode(zodToTs(c.schema as ZodObject<ZodRawShape>, c.pascalName).node)}`),
    'interface Collections {',
    ...options.collections.map(c => `  ${c.name}: ${c.pascalName}`),
    '}',
    '',
    'declare module \'@farnabaz/content-next\' {',
    '  interface PageCollections {',
    ...options.collections.filter(c => c.type === 'page').map(c => `    ${c.name}: ${c.pascalName}`),
    '  }',
    '',
    '  interface Collections {',
    ...options.collections.map(c => `    ${c.name}: ${c.pascalName}`),
    '  }',
    '}',
    '',
  ].join('\n')
}

export function collectionsTemplate({ options }: { options: { collections: ResolvedCollection[] } }) {
  return 'export const collections = ' + JSON.stringify(options.collections.map(c => ({
    name: c.name,
    pascalName: c.pascalName,
    jsonFields: c.jsonFields,
    schema: zodToJsonSchema(c.schema, c.name),
  })), null, 2)
}
