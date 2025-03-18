import { minimatch } from 'minimatch'
import type { CollectionInfo, ResolvedCollectionSource } from '@nuxt/content'
import { joinURL, withoutLeadingSlash } from 'ufo'
import type { JsonSchema7ObjectType } from 'zod-to-json-schema'
import { hash } from 'ohash'
import { getOrderedSchemaKeys } from '../schema'
import { parseSourceBase } from './utils'
import { withoutRoot } from './files'

export const getCollectionByFilePath = (path: string, collections: Record<string, CollectionInfo>): { collection: CollectionInfo, matchedSource: ResolvedCollectionSource } => {
  let matchedSource: ResolvedCollectionSource
  const collection = Object.values(collections).find((collection) => {
    if (!collection.source || collection.source.length === 0) {
      return
    }

    const pathWithoutRoot = withoutRoot(path)
    const paths = pathWithoutRoot === '/' ? ['index.yml', 'index.yaml', 'index.md', 'index.json'] : [pathWithoutRoot]
    return paths.some((p) => {
      matchedSource = collection.source.find(source => minimatch(p, source.include) && !source.exclude?.some(exclude => minimatch(p, exclude)))
      return matchedSource
    })
  })

  return {
    collection,
    matchedSource,
  }
}

export const getCollectionByRoutePath = (routePath: string, collections: Record<string, CollectionInfo>): { collection: CollectionInfo, matchedSource: ResolvedCollectionSource } => {
  let matchedSource: ResolvedCollectionSource
  const collection = Object.values(collections).find((collection) => {
    if (!collection.source || collection.source.length === 0) {
      return
    }

    matchedSource = collection.source.find((source) => {
      if (!routePath.startsWith(source.prefix)) {
        return
      }

      if (routePath === '/' || routePath === source.prefix) {
        const indexFiles = ['index.yml', 'index.yaml', 'index.md', 'index.json']
        const files = routePath === '/' ? indexFiles : indexFiles.map(file => withoutLeadingSlash(joinURL(source.prefix, file)))
        return files.some((p) => {
          return collection.source.find(source => minimatch(p, source.include) && !source.exclude?.some(exclude => minimatch(p, exclude)))
        })
      }

      const pathWithoutPrefix = routePath.substring(source.prefix.length)

      const { fixed } = parseSourceBase(source)

      const path = joinURL(fixed, pathWithoutPrefix)

      const removeExtension = (pattern: string) => {
        return pattern.replace(/\.[^/.]+$/, '')
      }

      return minimatch(path, removeExtension(source.include)) && !source.exclude?.some(exclude => minimatch(path, removeExtension(exclude)))
    })

    return matchedSource
  })

  return {
    collection,
    matchedSource,
  }
}

export function generateCollectionInsert(collection: CollectionInfo, data: Record<string, unknown>) {
  const values = computeValuesBasedOnCollectionSchema(collection, data)

  let index = 0

  return `INSERT INTO ${collection.tableName} VALUES (${'?, '.repeat(values.length).slice(0, -2)})`
    .replace(/\?/g, () => values[index++] as string)
}

export function generateRecordUpdate(collection: CollectionInfo, stem: string, data: Record<string, unknown>) {
  const deleteQuery = generateRecordDeletion(collection, stem)

  const insertQuery = generateCollectionInsert(collection, data)

  return `${deleteQuery}; ${insertQuery}`
}

export function generateRecordDeletion(collection: CollectionInfo, stem: string) {
  return `DELETE FROM ${collection.tableName} WHERE stem = '${stem}';`
}

export function generateRecordSelectByColumn(collection: CollectionInfo, column: string, value: string) {
  return `SELECT * FROM ${collection.tableName} WHERE ${column} = '${value}';`
}

function computeValuesBasedOnCollectionSchema(collection: CollectionInfo, data: Record<string, unknown>) {
  const fields: string[] = []
  const values: Array<string | number | boolean> = []
  const properties = (collection.schema.definitions[collection.name] as JsonSchema7ObjectType).properties
  const sortedKeys = getOrderedSchemaKeys(properties)

  sortedKeys.forEach((key) => {
    const value = (properties)[key]
    // const underlyingType = getUnderlyingType(value as ZodType<unknown, ZodOptionalDef>)
    const underlyingType = (value as JsonSchema7ObjectType).type

    const defaultValue = value.default !== undefined ? value.default : 'NULL'
    const valueToInsert = typeof data[key] !== 'undefined' ? data[key] : defaultValue

    fields.push(key)
    if (collection.fields[key] === 'json') {
      values.push(`'${JSON.stringify(valueToInsert).replace(/'/g, '\'\'')}'`)
    }
    else if (['string', 'enum'].includes(underlyingType)) {
      values.push(`'${String(valueToInsert).replace(/\n/g, '\\n').replace(/'/g, '\'\'')}'`)
    }
    // else if (['Date'].includes(underlyingType)) {
    //   values.push(valueToInsert !== 'NULL' ? `'${new Date(valueToInsert as string).toISOString()}'` : defaultValue)
    // }
    // else if (underlyingType.constructor.name === 'ZodBoolean') {
    //   values.push(valueToInsert !== 'NULL' ? !!valueToInsert : valueToInsert)
    // }
    else {
      values.push(valueToInsert)
    }
  })

  // add the hash in local dev database
  values.push(`'${hash(values)}'`)

  return values
}
