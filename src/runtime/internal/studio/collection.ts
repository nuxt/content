import { minimatch } from 'minimatch'
import type { CollectionInfo, ResolvedCollectionSource } from '@nuxt/content'
import { joinURL } from 'ufo'
import type { JsonSchema7ObjectType } from 'zod-to-json-schema'
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
      matchedSource = collection.source.find(source => minimatch(p, source.include))
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

      if (routePath === '/') {
        return ['index.yml', 'index.yaml', 'index.md', 'index.json'].some((p) => {
          return collection.source.find(source => minimatch(p, source.include))
        })
      }

      const pathWithoutPrefix = routePath.substring(source.prefix.length)

      const { fixed } = parseSourceBase(source)

      const path = joinURL(fixed, pathWithoutPrefix)

      return minimatch(path, source.include)
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

    const defaultValue = value.default ? value.default : 'NULL'
    const valueToInsert = typeof data[key] !== 'undefined' ? data[key] : defaultValue

    fields.push(key)
    if ((collection.jsonFields || []).includes(key)) {
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

  return values
}
