import { hash } from 'ohash'
import type { Collection, ResolvedCollection, CollectionSource, DefinedCollection, ResolvedCollectionSource, CustomCollectionSource, ResolvedCustomCollectionSource } from '../types/collection'
import { getOrderedSchemaKeys, describeProperty, getCollectionFieldsTypes } from '../runtime/internal/schema'
import type { Draft07, ParsedContentFile } from '../types'
import { defineLocalSource, defineGitHubSource, defineBitbucketSource } from './source'
import { emptyStandardSchema, mergeStandardSchema, metaStandardSchema, pageStandardSchema, infoStandardSchema, detectSchemaVendor, replaceComponentSchemas } from './schema'
import { logger } from './dev'
import nuxtContentContext from './context'

export function getTableName(name: string) {
  return `_content_${name}`
}

export function defineCollection<T>(collection: Collection<T>): DefinedCollection {
  let standardSchema: Draft07 = emptyStandardSchema

  // Resolve schema context and convert schema to JSON Schema
  if (collection.schema) {
    const schemaCtx = nuxtContentContext().get(detectSchemaVendor(collection.schema))
    standardSchema = schemaCtx.toJSONSchema(collection.schema!, '__SCHEMA__')
  }
  standardSchema.definitions.__SCHEMA__ = replaceComponentSchemas(standardSchema.definitions.__SCHEMA__)!

  let extendedSchema: Draft07 = standardSchema
  if (collection.type === 'page') {
    extendedSchema = mergeStandardSchema(pageStandardSchema, extendedSchema)
  }

  extendedSchema = mergeStandardSchema(metaStandardSchema, extendedSchema)

  return {
    type: collection.type,
    source: resolveSource(collection.source),
    schema: standardSchema,
    extendedSchema: extendedSchema,
    fields: getCollectionFieldsTypes(extendedSchema),
  }
}

export function defineCollectionSource(source: CustomCollectionSource): ResolvedCustomCollectionSource {
  const resolvedSource = resolveSource({ ...source, cwd: '', include: '' })?.[0]

  if (!resolvedSource) {
    throw new Error('Invalid collection source')
  }

  return {
    _custom: true,
    ...resolvedSource,
  }
}

export function resolveCollection(name: string, collection: DefinedCollection): ResolvedCollection | undefined {
  if (/^[a-z_]\w*$/i.test(name) === false) {
    logger.warn([
      `Collection name "${name}" is invalid. Collection names must be valid JavaScript identifiers. This collection will be ignored.`,
    ].join('\n'))

    return undefined
  }

  return {
    ...collection,
    name,
    type: collection.type || 'page',
    tableName: getTableName(name),
    private: name === 'info',
  }
}

export function resolveCollections(collections: Record<string, DefinedCollection>): ResolvedCollection[] {
  collections.info = {
    type: 'data',
    source: undefined,
    schema: infoStandardSchema,
    extendedSchema: infoStandardSchema,
    fields: {},
  }

  return Object.entries(collections)
    .map(([name, collection]) => resolveCollection(name, collection))
    .filter(Boolean) as ResolvedCollection[]
}

/**
 * Process collection source and return refined source
 */
function resolveSource(source: string | CollectionSource | CollectionSource[] | undefined): ResolvedCollectionSource[] | undefined {
  if (!source) {
    return undefined
  }

  if (typeof source === 'string') {
    return [defineLocalSource({ include: source })]
  }

  const sources: CollectionSource[] = Array.isArray(source) ? source : [source]

  return sources.map((source) => {
    if ((source as ResolvedCollectionSource)._resolved) {
      return source as ResolvedCollectionSource
    }

    if (source.repository) {
      if (source.repository.startsWith('https://bitbucket.org/')) {
        return defineBitbucketSource(source)
      }
      return defineGitHubSource(source)
    }

    return defineLocalSource(source)
  })
}

/**
 * Limit of 100KB comes from a limitation in Cloudflare D1
 * @see https://developers.cloudflare.com/d1/platform/limits/
 */
export const MAX_SQL_QUERY_SIZE = 100000

/**
 * When we split a value in multiple SQL queries, we want to allow for a buffer
 * so if the rest of the query is a bit long, we will not hit the 100KB limit
 */
export const SLICE_SIZE = 70000

// Convert collection data to SQL insert statement
export function generateCollectionInsert(collection: ResolvedCollection, data: ParsedContentFile): { queries: string[], hash: string } {
  const fields: string[] = []
  const values: Array<string | number | boolean> = []

  const sortedKeys = getOrderedSchemaKeys(collection.extendedSchema)

  sortedKeys.forEach((key) => {
    const property = describeProperty(collection.extendedSchema, key)
    // const value = (collection.extendedSchema).shape[key]

    const defaultValue = 'default' in property ? property.default : 'NULL'

    const valueToInsert = (typeof data[key] === 'undefined' || String(data[key]) === 'null')
      ? defaultValue
      : data[key]

    fields.push(key)

    if (valueToInsert === 'NULL') {
      values.push(valueToInsert)
      return
    }

    if (property?.json) {
      values.push(`'${JSON.stringify(valueToInsert).replace(/'/g, '\'\'')}'`)
    }
    else if (property?.sqlType === 'BOOLEAN') {
      values.push(!!valueToInsert)
    }
    else if (property?.sqlType === 'INT') {
      values.push(Number(valueToInsert))
    }
    else if (property?.sqlType === 'DATE') {
      values.push(`'${new Date(valueToInsert as string).toISOString()}'`)
    }
    else if (property?.enum) {
      values.push(`'${String(valueToInsert).replace(/\n/g, '\\n').replace(/'/g, '\'\'')}'`)
    }
    else if ((property?.sqlType || '').match(/^(VARCHAR|TEXT)/)) {
      values.push(`'${String(valueToInsert).replace(/'/g, '\'\'')}'`)
    }
    else {
      values.push(String(valueToInsert))
    }
  })

  const valuesHash = hash(values)
  values.push(`'${valuesHash}'`)

  let index = 0
  const sql = `INSERT INTO ${collection.tableName} VALUES (${'?, '.repeat(values.length).slice(0, -2)});`
    .replace(/\?/g, () => values[index++] as string)

  if (sql.length < MAX_SQL_QUERY_SIZE) {
    return {
      queries: [sql],
      hash: valuesHash,
    }
  }

  // Split the SQL into multiple statements:
  // Take the biggest column to insert (usually body) and split the column in multiple strings
  // first we insert the row in the database, then we update it with the rest of the string by concatenation
  const biggestColumn = [...values].sort((a, b) => String(b).length - String(a).length)[0]
  const bigColumnIndex = values.indexOf(biggestColumn!)
  const bigColumnName = fields[bigColumnIndex]

  function getSliceIndex(column: string, initialIndex: number) {
    let sliceIndex = initialIndex
    while (['\\', '"', '\''].includes(column[sliceIndex - 1]!)) {
      sliceIndex -= 1
    }
    return sliceIndex
  }

  if (typeof biggestColumn === 'string') {
    let sliceIndex = getSliceIndex(biggestColumn, SLICE_SIZE)

    values[bigColumnIndex] = `${biggestColumn.slice(0, sliceIndex)}'`
    index = 0

    const bigValueSliceWithHash = [...values.slice(0, -1), `'${valuesHash}-${sliceIndex}'`]

    const SQLQueries = [
      `INSERT INTO ${collection.tableName} VALUES (${'?, '.repeat(bigValueSliceWithHash.length).slice(0, -2)});`.replace(/\?/g, () => bigValueSliceWithHash[index++] as string),
    ]
    while (sliceIndex < biggestColumn.length) {
      const prevSliceIndex = sliceIndex
      sliceIndex = getSliceIndex(biggestColumn, sliceIndex + SLICE_SIZE)

      const isLastSlice = sliceIndex > biggestColumn.length
      const newSlice = `'${biggestColumn.slice(prevSliceIndex, sliceIndex)}` + (!isLastSlice ? '\'' : '')
      const sliceHash = isLastSlice ? valuesHash : `${valuesHash}-${sliceIndex}`
      SQLQueries.push([
        'UPDATE',
        collection.tableName,
        `SET ${bigColumnName} = CONCAT(${bigColumnName}, ${newSlice}), "__hash__" = '${sliceHash}'`,
        'WHERE',
        `id = ${values[0]} AND "__hash__" = '${valuesHash}-${prevSliceIndex}';`,
      ].join(' '))
    }
    return { queries: SQLQueries, hash: valuesHash }
  }

  return {
    queries: [sql],
    hash: valuesHash,
  }
}

// Convert a collection with Zod schema to SQL table definition
export function generateCollectionTableDefinition(collection: ResolvedCollection, opts: { drop?: boolean } = {}) {
  const sortedKeys = getOrderedSchemaKeys(collection.extendedSchema)
  const sqlFields = sortedKeys.map((key) => {
    if (key === 'id') return `${key} TEXT PRIMARY KEY`

    const property = describeProperty(collection.extendedSchema, key)

    let sqlType = property?.sqlType

    if (!sqlType) throw new Error(`Unsupported Zod type: ${property?.type}`)

    // Handle string length
    if (property.sqlType === 'VARCHAR' && property.maxLength) {
      sqlType += `(${property.maxLength})`
    }

    // Handle optional fields
    const constraints: string[] = [
      property?.nullable ? ' NULL' : '',
    ]

    // Handle default values
    if ('default' in property) {
      let defaultValue = typeof property.default === 'string'
        ? wrapWithSingleQuote(property.default)
        : property.default

      if (!(defaultValue instanceof Date) && typeof defaultValue === 'object') {
        defaultValue = wrapWithSingleQuote(JSON.stringify(defaultValue))
      }
      constraints.push(`DEFAULT ${defaultValue}`)
    }

    return `"${key}" ${sqlType}${constraints.join(' ')}`
  })

  // add __hash__ field for inserts
  sqlFields.push('"__hash__" TEXT UNIQUE')

  let definition = `CREATE TABLE IF NOT EXISTS ${collection.tableName} (${sqlFields.join(', ')});`

  if (opts.drop) {
    definition = `DROP TABLE IF EXISTS ${collection.tableName};\n${definition}`
  }

  return definition
}

function wrapWithSingleQuote(value: string) {
  if (value.startsWith('`') && value.endsWith('`')) {
    value = value.slice(1, -1)
  }
  if (value.startsWith('\'') && value.endsWith('\'')) {
    return value
  }
  return `'${value}'`
}
