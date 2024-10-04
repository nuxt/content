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
    'import type { PageCollectionItemBase, DataCollectionItemBase } from \'@farnabaz/content-next\'',
    '',
    'declare module \'@farnabaz/content-next\' {',
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
  const collectionsMeta = options.collections.reduce((acc, collection) => {
    acc[collection.name] = {
      name: collection.name,
      pascalName: collection.pascalName,
      // Remove source from collection meta if it's a remote collection
      source: collection.source?.repository ? undefined : collection.source,
      type: collection.type,
      jsonFields: collection.jsonFields,
      schema: zodToJsonSchema(collection.extendedSchema, collection.name),
    }
    return acc
  }, {} as Record<string, unknown>)

  return 'export const collections = ' + JSON.stringify(collectionsMeta, null, 2)
}
