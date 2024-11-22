import { minimatch } from 'minimatch'
import type { CollectionInfo } from '@nuxt/content'
// import { joinURL, withoutLeadingSlash } from 'ufo'
import { getOrderedSchemaKeys } from '../schema'
// import { parseSourceBase } from './utils'
import { withoutRoot } from './files'

export const getCollectionByPath = (path: string, collections: Record<string, CollectionInfo>): CollectionInfo => {
  return Object.values(collections).find((collection) => {
    if (!collection.source) {
      return
    }

    const pathWithoutRoot = withoutRoot(path)

    // TODO HANDLE PREFIX
    // const prefix = withoutLeadingSlash(collection.source.prefix)

    // if (!pathWithoutRoot.startsWith(prefix)) {
    //   return false
    // }

    // const { fixed } = parseSourceBase(collection.source)

    // path = joinURL(fixed, pathWithoutRoot.substring(withoutLeadingSlash(collection.source.prefix).length))

    const paths = pathWithoutRoot === '/' ? ['index.yml', 'index.yaml', 'index.md', 'index.json'] : [pathWithoutRoot]
    return paths.some((p) => {
      return minimatch(p, collection.source.include)
    })
  })
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
  return `DELETE FROM ${collection.tableName} WHERE stem = '${stem}'`
}

export function generateRecordSelectByColumn(collection: CollectionInfo, column: string, value: string) {
  return `SELECT * FROM ${collection.tableName} WHERE ${column} = '${value}'`
}

function computeValuesBasedOnCollectionSchema(collection: CollectionInfo, data: Record<string, unknown>) {
  const fields: string[] = []
  const values: Array<string | number | boolean> = []
  const properties = collection.schema.definitions[collection.name].properties
  const sortedKeys = getOrderedSchemaKeys(properties)

  sortedKeys.forEach((key) => {
    const value = (properties)[key]
    // const underlyingType = getUnderlyingType(value as ZodType<unknown, ZodOptionalDef>)
    const underlyingType = value.type

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
