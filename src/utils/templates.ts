import { gzip } from 'node:zlib'
import type { NuxtTemplate } from '@nuxt/schema'
import { isAbsolute, join, relative } from 'pathe'
import { genDynamicImport } from 'knitwork'
import { compile as jsonSchemaToTypescript, type JSONSchema } from 'json-schema-to-typescript'
import { pascalCase } from 'scule'
import type { Schema } from 'untyped'
import type { CollectionInfo, ResolvedCollection } from '../types/collection'
import type { Manifest } from '../types/manifest'
import type { GitInfo } from './git'
import { generateCollectionTableDefinition } from './collection'

const compress = (text: string): Promise<string> => {
  return new Promise((resolve, reject) => gzip(text, (err, buff) => {
    if (err) {
      return reject(err)
    }
    return resolve(buff?.toString('base64'))
  }))
}

function indentLines(str: string, indent: number = 2) {
  return str
    .replace(/ {4}/g, ' '.repeat(indent))
    .split('\n')
    .map(line => ' '.repeat(indent) + line)
    .join('\n')
}

export const moduleTemplates = {
  types: 'content/types.d.ts',
  preview: 'content/preview.mjs',
  manifest: 'content/manifest.ts',
  components: 'content/components.ts',
  fullCompressedDump: 'content/database.compressed.mjs',
  fullRawDump: 'content/sql_dump.txt',
}

export const contentTypesTemplate = (collections: ResolvedCollection[]) => ({
  filename: moduleTemplates.types as `${string}.d.ts`,
  getContents: async ({ options }) => {
    const publicCollections = (options.collections as ResolvedCollection[]).filter(c => !c.private)
    const pagesCollections = publicCollections.filter(c => c.type === 'page')

    const parentInterface = (c: ResolvedCollection) => c.type === 'page' ? 'PageCollectionItemBase' : 'DataCollectionItemBase'
    return [
      'import type { PageCollectionItemBase, DataCollectionItemBase } from \'@nuxt/content\'',
      '',
      'declare module \'@nuxt/content\' {',
      ...(await Promise.all(
        publicCollections.map(async (c) => {
          const type = await jsonSchemaToTypescript(c.schema as JSONSchema, 'CLASS')
            .then(code => code.replace('export interface CLASS', `interface ${pascalCase(c.name)}CollectionItem extends ${parentInterface(c)}`))
          return indentLines(` ${type}`)
        }),
      )),
      '',
      '  interface PageCollections {',
      ...pagesCollections.map(c => indentLines(`${c.name}: ${pascalCase(c.name)}CollectionItem`, 4)),
      '  }',
      '',
      '  interface Collections {',
      ...publicCollections.map(c => indentLines(`${c.name}: ${pascalCase(c.name)}CollectionItem`, 4)),
      '  }',
      '}',
      '',
    ].join('\n')
  },
  options: {
    collections,
  },
} satisfies NuxtTemplate)

export const fullDatabaseCompressedDumpTemplate = (manifest: Manifest) => ({
  filename: moduleTemplates.fullCompressedDump,
  getContents: async ({ options }: { options: { manifest: Manifest } }) => {
    const result = [] as string[]
    for (const [key, dump] of Object.entries(options.manifest.dump)) {
      // Ignore provate collections
      if (options.manifest.collections.find(c => c.name === key)?.private) {
        return ''
      }
      const compressedDump = await compress(JSON.stringify(dump))
      result.push(`export const ${key} = "${compressedDump}"`)
    }

    return result.join('\n')
  },
  write: true,
  options: {
    manifest,
  },
})

export const fullDatabaseRawDumpTemplate = (manifest: Manifest) => ({
  filename: moduleTemplates.fullRawDump,
  getContents: ({ options }: { options: { manifest: Manifest } }) => {
    return Object.entries(options.manifest.dump).map(([_key, value]) => {
      return value.join('\n')
    }).join('\n')
  },
  write: true,
  options: {
    manifest,
  },
})

export const collectionDumpTemplate = (collection: string, manifest: Manifest) => ({
  filename: `content/raw/dump.${collection}.sql`,
  getContents: async ({ options }: { options: { manifest: Manifest } }) => {
    return compress(JSON.stringify((options.manifest.dump[collection] || [])))
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
        .filter((c) => {
          // Ignore island components
          if (c.island) {
            return false
          }

          // Ignore css modules
          if (c.filePath.endsWith('.css')) {
            return false
          }

          return nuxt.options.dev || options.manifest.components.includes(c.pascalName) || c.global
        })
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

export const manifestTemplate = (manifest: Manifest) => ({
  filename: moduleTemplates.manifest,
  getContents: ({ options }: { options: { manifest: Manifest } }) => {
    const collectionsMeta = options.manifest.collections.reduce((acc, collection) => {
      acc[collection.name] = {
        type: collection.type,
        fields: collection.fields,
      }
      return acc
    }, {} as Record<string, unknown>)

    return [
      `export const checksums = ${JSON.stringify(manifest.checksum, null, 2)}`,
      `export const checksumsStructure = ${JSON.stringify(manifest.checksumStructure, null, 2)}`,
      '',
      `export const tables = ${JSON.stringify(
        Object.fromEntries(manifest.collections.map(c => [c.name, c.tableName])),
        null,
        2,
      )}`,
      '',
      'export default ' + JSON.stringify(collectionsMeta, null, 2),
    ].join('\n')
  },
  options: {
    manifest,
  },
  write: true,
})

export const previewTemplate = (collections: ResolvedCollection[], gitInfo: GitInfo, schema: Schema) => ({
  filename: moduleTemplates.preview,
  getContents: ({ options }: { options: { collections: ResolvedCollection[] } }) => {
    const collectionsMeta = options.collections.reduce((acc, collection) => {
      const schemaWithCollectionName = {
        ...collection.extendedSchema,
        definitions: {
          [collection.name]: collection.extendedSchema.definitions['__SCHEMA__'],
        },
      }
      acc[collection.name] = {
        name: collection.name,
        pascalName: pascalCase(collection.name),
        tableName: collection.tableName,
        // Remove source from collection meta if it's a remote collection
        source: collection.source?.filter(source => source.repository ? undefined : collection.source) || [],
        type: collection.type,
        fields: collection.fields,
        schema: schemaWithCollectionName,
        tableDefinition: generateCollectionTableDefinition(collection),
      }
      return acc
    }, {} as Record<string, CollectionInfo>)

    const appConfigMeta = {
      properties: schema.properties?.appConfig,
      default: (schema.default as Record<string, unknown>)?.appConfig,
    }

    return [
      'export const collections = ' + JSON.stringify(collectionsMeta, null, 2),
      'export const gitInfo = ' + JSON.stringify(gitInfo, null, 2),
      'export const appConfigSchema = ' + JSON.stringify(appConfigMeta, null, 2),
    ].join('\n')
  },
  options: {
    collections,
    gitInfo,
  },
  write: true,
})
