import { readFile } from 'node:fs/promises'
import { gzip } from 'node:zlib'
import type { Nuxt, NuxtTemplate } from '@nuxt/schema'
import { isAbsolute, join, relative } from 'pathe'
import { compile as jsonSchemaToTypescript } from 'json-schema-to-typescript-lite'
import type { JSONSchema } from 'json-schema-to-typescript-lite'
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

/**
 * Read what the last build wrote for this template.
 *
 * `nuxt prepare` and `nuxt typecheck` build with `_prepare: true`, and in that
 * mode collections are not indexed: the manifest carries no dump and no
 * checksums. Writing the templates from it would tell the app that there is no
 * content at all. A dev server that shares the same build dir picks the files
 * up, fails the integrity check and drops its collection tables, so its content
 * is gone until it is restarted. Keeping the previous file avoids that.
 */
async function contentsOfPreviousBuild(nuxt: Nuxt, filename: string) {
  return await readFile(join(nuxt.options.buildDir, filename), 'utf8').catch(() => undefined)
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
  getContents: async ({ nuxt, options }: { nuxt: Nuxt, options: { manifest: Manifest } }) => {
    if (nuxt.options._prepare) {
      const previous = await contentsOfPreviousBuild(nuxt, moduleTemplates.fullCompressedDump)
      if (previous !== undefined) {
        return previous
      }
    }

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
  getContents: async ({ nuxt, options }: { nuxt: Nuxt, options: { manifest: Manifest } }) => {
    if (nuxt.options._prepare) {
      const previous = await contentsOfPreviousBuild(nuxt, moduleTemplates.fullRawDump)
      if (previous !== undefined) {
        return previous
      }
    }

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
  getContents: async ({ nuxt, options }: { nuxt: Nuxt, options: { manifest: Manifest } }) => {
    if (nuxt.options._prepare) {
      const previous = await contentsOfPreviousBuild(nuxt, `content/raw/dump.${collection}.sql`)
      if (previous !== undefined) {
        return previous
      }
    }

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
    getContents: async ({ app, nuxt, options }) => {
      if (nuxt.options._prepare) {
        const previous = await contentsOfPreviousBuild(nuxt, moduleTemplates.components)
        if (previous !== undefined) {
          return previous
        }
      }

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
          const importPath = isAbsolute(c.filePath)
            ? './' + relative(join(nuxt.options.buildDir, 'content'), c.filePath).replace(/\b\.(?!vue)\w+$/g, '')
            : c.filePath.replace(/\b\.(?!vue)\w+$/g, '')
          map[c.pascalName] = map[c.pascalName] || [c.pascalName, importPath, c.global, c.export || 'default']
          return map
        }, {} as Record<string, unknown[]>)

      const componentsList = Object.values(componentsMap)
      const globalComponents = componentsList.filter(c => c[2]).map(c => c[0])
      const localComponents = componentsList.filter(c => !c[2])
      return [
        'const pickExport = (mod, exportName, componentName, path) => {',
        '  const resolved = exportName === \'default\' ? mod?.default : mod?.[exportName]',
        '  if (!resolved) {',
        '    throw new Error(`[nuxt-content] Missing export "${exportName}" for component "${componentName}" in "${path}".`)',
        '  }',
        '  return resolved',
        '}',
        'export const localComponentLoaders = {',
        ...localComponents.map(([pascalName, path, , exp]) => {
          const pathLiteral = JSON.stringify(path)
          const exportLiteral = JSON.stringify(exp)
          const nameLiteral = JSON.stringify(pascalName)
          return `  ${pascalName}: () => import(${pathLiteral}).then(m => pickExport(m, ${exportLiteral}, ${nameLiteral}, ${pathLiteral})),`
        }),
        '}',
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
  getContents: async ({ nuxt, options }: { nuxt: Nuxt, options: { manifest: Manifest } }) => {
    if (nuxt.options._prepare) {
      const previous = await contentsOfPreviousBuild(nuxt, moduleTemplates.manifest)
      if (previous !== undefined) {
        return previous
      }
    }

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
      // Only include non remote collections and collections with at least one local source (remove `info` collection)
      const localSources = collection.source?.filter(source => !source.repository) ?? []
      if (localSources.length === 0) {
        return acc
      }

      const schemaWithCollectionName = {
        ...collection.extendedSchema,
        definitions: {
          [collection.name]: collection.extendedSchema.definitions['__SCHEMA__']!,
        },
      }
      acc[collection.name] = {
        name: collection.name,
        pascalName: pascalCase(collection.name),
        tableName: collection.tableName,
        source: localSources,
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
