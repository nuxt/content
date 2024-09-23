import { printNode, zodToTs } from 'zod-to-ts'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type { ResolvedCollection } from '../types/collection'

function indentLines(str: string, indent: number = 2) {
  str = str.replace(/ {4}/g, ' '.repeat(indent))
  return str.split('\n').map(line => ' '.repeat(indent) + line).join('\n')
}

export function contentTypesTemplate({ options }: { options: { collections: ResolvedCollection[] } }) {
  const publicCollections = options.collections.filter(c => c.name !== '_info')
  const pagesCollections = publicCollections.filter(c => c.type === 'page')
  return [
    'declare module \'@farnabaz/content-next\' {',
    ...publicCollections.map(c =>
      indentLines(`type ${c.pascalName}CollectionItem = ${printNode(zodToTs(c.schema, c.pascalName).node)}`),
    ),
    '',
    '  interface PageCollections {',
    ...pagesCollections.map(c => indentLines(`${c.name}: ${c.pascalName}CollectionItem`, 4)),
    '  }',
    '',
    '  interface Collections {',
    ...publicCollections.map(c => indentLines(`${c.name}: ${c.pascalName}CollectionItem`, 4)),
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
