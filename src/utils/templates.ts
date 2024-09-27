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

  const parentInterface = (c: ResolvedCollection) => c.type === 'page' ? 'PageCollectionItemBase' : 'DataCollectionItemBase'
  return [
    'import type { PageCollectionItemBase, DataCollectionItemBase } from \'@nuxt/content\'',
    '',
    'declare module \'@nuxt/content\' {',
    ...publicCollections.map(c =>
      indentLines(`interface ${c.pascalName}CollectionItem extends ${parentInterface(c)} ${printNode(zodToTs(c.schema, c.pascalName).node)}`),
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
  const collectionsMeta = options.collections.map(c => [
    c.name,
    {
      name: c.name,
      pascalName: c.pascalName,
      type: c.type,
      schema: zodToJsonSchema(c.extendedSchema, c.name),
      jsonFields: c.jsonFields,
    },
  ])
  return 'export const collections = ' + JSON.stringify(Object.fromEntries(collectionsMeta), null, 2)
}
