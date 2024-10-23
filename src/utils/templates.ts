import { printNode, zodToTs } from 'zod-to-ts'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type { NuxtTemplate } from '@nuxt/schema'
import { isAbsolute, join, relative } from 'pathe'
import { genDynamicImport } from 'knitwork'
import { deflate } from 'pako'
import type { ResolvedCollection } from '../types/collection'

function indentLines(str: string, indent: number = 2) {
  return str
    .replace(/ {4}/g, ' '.repeat(indent))
    .split('\n')
    .map(line => ' '.repeat(indent) + line)
    .join('\n')
}

export const contentTypesTemplate = (collections: ResolvedCollection[]) => ({
  filename: 'content/types.d.ts' as const,
  getContents: ({ options }) => {
    const publicCollections = (options.collections as ResolvedCollection[]).filter(c => c.name !== '_info')
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
  },
  options: {
    collections,
  },
} satisfies NuxtTemplate)

export const collectionsTemplate = (collections: ResolvedCollection[]) => ({
  filename: 'content/collections.mjs' as const,
  getContents: ({ options }: { options: { collections: ResolvedCollection[] } }) => {
    const collectionsMeta = options.collections.reduce((acc, collection) => {
      acc[collection.name] = {
        name: collection.name,
        pascalName: collection.pascalName,
        tableName: collection.tableName,
        // Remove source from collection meta if it's a remote collection
        source: collection.source?.repository ? undefined : collection.source,
        type: collection.type,
        jsonFields: collection.jsonFields,
        schema: zodToJsonSchema(collection.extendedSchema, collection.name),
      }
      return acc
    }, {} as Record<string, unknown>)

    return 'export const collections = ' + JSON.stringify(collectionsMeta, null, 2)
  },
  options: {
    collections,
  },
  write: true,
})

export const sqlDumpTemplate = (manifest: { dump: string[] }) => ({
  filename: 'content/dump.mjs' as const,
  getContents: ({ options }: { options: { manifest: { dump: string[] } } }) => {
    const compressed = deflate(options.manifest.dump.join('\n'))

    const str = Buffer.from(compressed.buffer).toString('base64')
    return `export default '${str}'`
  },
  write: true,
  options: {
    manifest,
  },
})

export const sqlDumpTemplateRaw = (manifest: { dump: string[] }) => ({
  filename: 'content/raw/compressed.sql' as const,
  getContents: ({ options }: { options: { manifest: { dump: string[] } } }) => {
    const compressed = deflate(options.manifest.dump.join('\n'))

    const str = Buffer.from(compressed.buffer).toString('base64')
    return str
  },
  write: true,
  options: {
    manifest,
  },
})

export const componentsManifestTemplate = (manifest: { components: string[] }) => {
  return {
    filename: 'content/components.ts',
    write: true,
    getContents: ({ app, nuxt, options }) => {
      const componentsMap = app.components
        .filter(c => !c.island && (nuxt.options.dev || options.manifest.components.includes(c.pascalName) || c.global))
        .reduce((map, c) => {
          map[c.pascalName] = map[c.pascalName] || [
            c.pascalName,
            `${genDynamicImport(isAbsolute(c.filePath)
              ? './' + relative(join(nuxt.options.buildDir, 'content'), c.filePath).replace(/\b\.(?!vue)\w+$/g, '')
              : c.filePath.replace(/\b\.(?!vue)\w+$/g, ''), { wrapper: false, singleQuotes: true })}`,
            c.global,
          ]
          return map
        }, {} as Record<string, unknown[]>)

      const componentsList = Object.values(componentsMap)
      const globalComponents = componentsList.filter(c => c[2]).map(c => c[0])
      const localComponents = componentsList.filter(c => !c[2])
      return [
        ...localComponents.map(([pascalName, type]) => `export const ${pascalName} = () => ${type}`),
        `export const globalComponents: string[] = ${JSON.stringify(globalComponents)}`,
        `export const localComponents: string[] = ${JSON.stringify(localComponents.map(c => c[0]))}`,
      ].join('\n')
    },
    options: {
      manifest,
    },
  } satisfies NuxtTemplate
}

export const manifestTemplate = (collections: ResolvedCollection[], manifest: { integrityVersion: string }) => ({
  filename: 'content/manifest.ts' as const,
  getContents: ({ options }: { options: { collections: ResolvedCollection[], manifest: { integrityVersion: string } } }) => {
    const collectionsMeta = options.collections.reduce((acc, collection) => {
      acc[collection.name] = {
        jsonFields: collection.jsonFields,
      }
      return acc
    }, {} as Record<string, unknown>)

    return [
      'export const integrityVersion = "' + options.manifest.integrityVersion + '"',
      '',
      `export function tables = ${JSON.stringify(
        Object.fromEntries(collections.map(c => [c.name, c.tableName])),
      )}`,
      '',
      'export default ' + JSON.stringify(collectionsMeta, null, 2),
    ].join('\n')
  },
  options: {
    collections,
    manifest,
  },
  write: true,
})
