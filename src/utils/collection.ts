import type { ZodObject, ZodOptionalDef, ZodRawShape, ZodStringDef, ZodType } from 'zod'
import { hash } from 'ohash'
import type { Collection, ResolvedCollection, CollectionSource, DefinedCollection, ResolvedCollectionSource, CustomCollectionSource, ResolvedCustomCollectionSource } from '../types/collection'
import { getOrderedSchemaKeys } from '../runtime/internal/schema'
import type { ParsedContentFile } from '../types'
import { defineLocalSource, defineGitHubSource, defineBitbucketSource } from './source'
import { metaSchema, pageSchema } from './schema'
import type { ZodFieldType } from './zod'
import { getUnderlyingType, ZodToSqlFieldTypes, z, getUnderlyingTypeName } from './zod'
import { logger } from './dev'

const JSON_FIELDS_TYPES = ['ZodObject', 'ZodArray', 'ZodRecord', 'ZodIntersection', 'ZodUnion', 'ZodAny', 'ZodMap']

export function getTableName(name: string) {
  return `_content_${name}`
}

export function defineCollection<T extends ZodRawShape>(collection: Collection<T>): DefinedCollection {
  let schema = collection.schema || z.object({})
  if (collection.type === 'page') {
    schema = pageSchema.extend((schema as ZodObject<ZodRawShape>).shape)
  }

  schema = metaSchema.extend((schema as ZodObject<ZodRawShape>).shape)

  return {
    type: collection.type,
    source: resolveSource(collection.source),
    schema: collection.schema || z.object({}),
    extendedSchema: schema,
    fields: Object.keys(schema.shape).reduce((acc, key) => {
      const underlyingType = getUnderlyingTypeName(schema.shape[key as keyof typeof schema.shape])
      if (JSON_FIELDS_TYPES.includes(underlyingType)) {
        acc[key] = 'json'
      }
      else if (['ZodString'].includes(underlyingType)) {
        acc[key] = 'string'
      }
      else if (['ZodDate'].includes(underlyingType)) {
        acc[key] = 'date'
      }
      else if (underlyingType === 'ZodBoolean') {
        acc[key] = 'boolean'
      }
      else if (underlyingType === 'ZodNumber') {
        acc[key] = 'number'
      }
      else {
        acc[key] = 'string'
      }
      return acc
    }, {} as Record<string, 'string' | 'number' | 'boolean' | 'date' | 'json'>),
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
    schema: z.object({
      id: z.string(),
      version: z.string(),
      structureVersion: z.string(),
      ready: z.boolean(),
    }),
    extendedSchema: z.object({
      id: z.string(),
      version: z.string(),
      structureVersion: z.string(),
      ready: z.boolean(),
    }),
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
export const MAX_SQL_QUERY_SIZE = 80000

/**
 * When we split a value in multiple SQL queries, we want to allow for a buffer
 * so if the rest of the query is a bit long, we will not hit the 100KB limit
 */
export const SLICE_SIZE = 40000

export function generateCollectionInsert(collection: ResolvedCollection, data: ParsedContentFile): { queries: string[], hash: string } {
  const fields: string[] = []
  const values: Array<string | number | boolean> = []
  const sortedKeys = getOrderedSchemaKeys((collection.extendedSchema).shape)

  const largeFieldIndexes: number[] = []
  const rawStringValues: { [key: string]: string } = {}

  sortedKeys.forEach((key) => {
    const zodType = (collection.extendedSchema).shape[key]!
    const underlyingType = getUnderlyingType(zodType as ZodType<unknown, ZodOptionalDef>)

    const defaultValue = zodType?._def.defaultValue ? zodType._def.defaultValue() : 'NULL'

    const rawValue = (typeof data[key] === 'undefined' || data[key] === null || data[key] === undefined)
      ? defaultValue
      : data[key]

    fields.push(key)

    let sqlValue: string | number | boolean
    if (rawValue === 'NULL') {
      sqlValue = rawValue
    }
    else if (collection.fields[key] === 'json') {
      sqlValue = `'${JSON.stringify(rawValue).replace(/'/g, '\'\'')}'`
    }
    else if (underlyingType.constructor.name === 'ZodEnum') {
      sqlValue = `'${String(rawValue).replace(/'/g, '\'\'')}'`
    }
    else if (underlyingType.constructor.name === 'ZodString') {
      const stringValue = String(rawValue)
      rawStringValues[key] = stringValue
      if (stringValue.length > SLICE_SIZE - 1) {
        largeFieldIndexes.push(fields.length - 1)
      }
      sqlValue = `'${stringValue.replace(/'/g, '\'\'')}'`
    }
    else if (collection.fields[key] === 'date') {
      sqlValue = `'${new Date(rawValue as string | number | Date).toISOString()}'`
    }
    else if (collection.fields[key] === 'boolean') {
      sqlValue = !!rawValue
    }
    else {
      sqlValue = rawValue
    }
    values.push(sqlValue)
  })

  const dataValuesForHashing = [...values]
  const valuesHash = hash(dataValuesForHashing)
  values.push(`'${valuesHash}'`)

  let sqlInsertIndex = 0
  const initialSql = `INSERT INTO ${collection.tableName} VALUES (${'?, '.repeat(values.length).slice(0, -2)});`
    .replace(/\?/g, () => values[sqlInsertIndex++] as string)

  const SQLQueries: string[] = []

  if (initialSql.length >= MAX_SQL_QUERY_SIZE && largeFieldIndexes.length > 0) {
    const bigFieldIndex = largeFieldIndexes[0]
    const fieldNameToSplit = fields[bigFieldIndex]
    const rawStringToSplit = rawStringValues[fieldNameToSplit]

    const insertValues = [...values]

    const firstChunkRaw = rawStringToSplit.slice(0, SLICE_SIZE - 1)
    insertValues[bigFieldIndex] = `'${firstChunkRaw.replace(/'/g, '\'\'')}'`

    const insertHashMarker = `${valuesHash}-${SLICE_SIZE}`
    insertValues[insertValues.length - 1] = `'${insertHashMarker}'`

    sqlInsertIndex = 0
    const insertQuery = `INSERT INTO ${collection.tableName} VALUES (${'?, '.repeat(insertValues.length).slice(0, -2)});`
      .replace(/\?/g, () => insertValues[sqlInsertIndex++] as string)
    SQLQueries.push(insertQuery)

    let currentRawOffset = SLICE_SIZE - 1
    let previousHashSuffixInLoop = SLICE_SIZE
    let updateLoopIndex = 0

    while (currentRawOffset < rawStringToSplit.length) {
      const nextRawChunkEndOffset = Math.min(currentRawOffset + SLICE_SIZE, rawStringToSplit.length)
      const chunkRaw = rawStringToSplit.slice(currentRawOffset, nextRawChunkEndOffset)

      if (chunkRaw.length === 0) break

      const chunkSqlEscaped = `'${chunkRaw.replace(/'/g, '\'\'')}'`
      const isLastSlice = nextRawChunkEndOffset >= rawStringToSplit.length

      const oldHashForWhereClause = `${valuesHash}-${previousHashSuffixInLoop}`

      let newHashForSetClause: string
      let nextHashSuffix: number | undefined = undefined
      if (isLastSlice) {
        newHashForSetClause = valuesHash
      }
      else {
        nextHashSuffix = (updateLoopIndex + 2) * SLICE_SIZE
        newHashForSetClause = `${valuesHash}-${nextHashSuffix}`
      }

      SQLQueries.push([
        'UPDATE',
        collection.tableName,
        `SET ${fieldNameToSplit} = CONCAT(${fieldNameToSplit}, ${chunkSqlEscaped}), "__hash__" = '${newHashForSetClause}'`,
        'WHERE',
        `${fields[0]} = ${values[0]} AND "__hash__" = '${oldHashForWhereClause}';`,
      ].join(' '))

      if (!isLastSlice && nextHashSuffix !== undefined) {
        previousHashSuffixInLoop = nextHashSuffix
      }
      currentRawOffset = nextRawChunkEndOffset
      updateLoopIndex++
    }
    return { queries: SQLQueries, hash: valuesHash }
  }

  SQLQueries.push(initialSql)
  return {
    queries: SQLQueries,
    hash: valuesHash,
  }
}

export function generateCollectionTableDefinition(collection: ResolvedCollection, opts: { drop?: boolean } = {}) {
  const sortedKeys = getOrderedSchemaKeys((collection.extendedSchema).shape)
  const sqlFields = sortedKeys.map((key) => {
    const type = (collection.extendedSchema).shape[key]!
    const underlyingType = getUnderlyingType(type)

    if (key === 'id') return `${key} TEXT PRIMARY KEY`

    let sqlType: string = ZodToSqlFieldTypes[underlyingType.constructor.name as ZodFieldType]

    if (JSON_FIELDS_TYPES.includes(underlyingType.constructor.name)) {
      sqlType = 'TEXT'
    }

    if (!sqlType) throw new Error(`Unsupported Zod type: ${underlyingType.constructor.name}`)

    if (underlyingType.constructor.name === 'ZodString') {
      const checks = (underlyingType._def as ZodStringDef).checks || []
      if (checks.some(check => check.kind === 'max')) {
        sqlType += `(${checks.find(check => check.kind === 'max')?.value})`
      }
    }

    const constraints = [
      type.isNullable() ? ' NULL' : '',
    ]

    if (type._def.defaultValue !== undefined) {
      let defaultValue = typeof type._def.defaultValue() === 'string'
        ? `'${type._def.defaultValue()}'`
        : type._def.defaultValue()

      if (!(defaultValue instanceof Date) && typeof defaultValue === 'object') {
        defaultValue = `'${JSON.stringify(defaultValue)}'`
      }
      constraints.push(`DEFAULT ${defaultValue}`)
    }

    return `"${key}" ${sqlType}${constraints.join(' ')}`
  })

  sqlFields.push('"__hash__" TEXT UNIQUE')

  let definition = `CREATE TABLE IF NOT EXISTS ${collection.tableName} (${sqlFields.join(', ')});`

  if (opts.drop) {
    definition = `DROP TABLE IF EXISTS ${collection.tableName};\n${definition}`
  }

  return definition
}
