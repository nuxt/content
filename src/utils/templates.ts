import { printNode, zodToTs } from 'zod-to-ts'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type { NuxtTemplate } from '@nuxt/schema'
import { isAbsolute, join, relative } from 'pathe'
import { genDynamicImport } from 'knitwork'
import { deflate } from 'pako'
import type { ResolvedCollection } from '../types/collection'
import type { Manifest } from '../types/manifest'

function indentLines(str: string, indent: number = 2) {
  return str
    .replace(/ {4}/g, ' '.repeat(indent))
    .split('\n')
    .map(line => ' '.repeat(indent) + line)
    .join('\n')
}

export const moduleTemplates = {
  types: 'content/types.d.ts',
  collections: 'content/collections.mjs',
  manifest: 'content/manifest.ts',
  components: 'content/components.ts',
  dump: 'content/dump.mjs',
}

export const contentTypesTemplate = (collections: ResolvedCollection[]) => ({
  filename: moduleTemplates.types as `${string}.d.ts`,
  getContents: ({ options }) => {
    const publicCollections = (options.collections as ResolvedCollection[]).filter(c => !c.private)
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
  filename: moduleTemplates.collections,
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

export const sqlDumpTemplate = (manifest: Manifest) => ({
  filename: moduleTemplates.dump,
  getContents: ({ options }: { options: { manifest: Manifest } }) => {
    return Object.entries(options.manifest.dump).map(([key, value]) => {
      const str = Buffer.from(deflate(value.join('\n')).buffer).toString('base64')
      return `export const ${key} = "${str}"`
    }).join('\n')
  },
  write: true,
  options: {
    manifest,
  },
})

export const sqlDumpTemplateRaw = (collection: string, manifest: Manifest) => ({
  filename: `content/raw/dump.${collection}.sql`,
  getContents: ({ options }: { options: { manifest: Manifest } }) => {
    const compressed = deflate((options.manifest.dump[collection] || []).join('\n'))

    return Buffer.from(compressed.buffer).toString('base64')
  },
  write: true,
  options: {
    manifest,
  },
})

export const componentsManifestTemplate = (manifest: Manifest) => {
  return {
    filename: moduleTemplates.components,
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

export const manifestTemplate = (collections: ResolvedCollection[], manifest: Manifest) => ({
  filename: moduleTemplates.manifest,
  getContents: ({ options }: { options: { collections: ResolvedCollection[], manifest: Manifest } }) => {
    const collectionsMeta = options.collections.reduce((acc, collection) => {
      acc[collection.name] = {
        jsonFields: collection.jsonFields,
      }
      return acc
    }, {} as Record<string, unknown>)

    return [
      `export const checksums: Record<string, string> = ${JSON.stringify(manifest.checksum, null, 2)}`,
      '',
      `export const tables: Record<string, string> = ${JSON.stringify(
        Object.fromEntries(collections.map(c => [c.name, c.tableName])),
        null,
        2,
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
