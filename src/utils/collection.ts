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
  const sortedKeys = getOrderedSchemaKeys((collection.extendedSchema).shape)

  sortedKeys.forEach((key) => {
    const value = (collection.extendedSchema).shape[key]
    const underlyingType = getUnderlyingType(value as ZodType<unknown, ZodOptionalDef>)

    let defaultValue = value?._def.defaultValue ? value?._def.defaultValue() : 'NULL'

    if (!(defaultValue instanceof Date) && typeof defaultValue === 'object') {
      defaultValue = JSON.stringify(defaultValue)
    }
    const valueToInsert = (typeof data[key] === 'undefined' || String(data[key]) === 'null')
      ? defaultValue
      : data[key]

    fields.push(key)

    if (valueToInsert === 'NULL') {
      values.push(valueToInsert)
      return
    }

    if (collection.fields[key] === 'json') {
      values.push(`'${JSON.stringify(valueToInsert).replace(/'/g, '\'\'')}'`)
    }
    else if (['ZodString', 'ZodEnum'].includes(underlyingType.constructor.name)) {
      values.push(`'${String(valueToInsert).replace(/\n/g, '\\n').replace(/'/g, '\'\'')}'`)
    }
    else if (collection.fields[key] === 'date') {
      values.push(`'${new Date(valueToInsert as string).toISOString()}'`)
    }
    else if (collection.fields[key] === 'boolean') {
      values.push(!!valueToInsert)
    }
    else {
      values.push(valueToInsert)
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
  const bigColumnIndex = values.indexOf(biggestColumn)
  const bigColumnName = fields[bigColumnIndex]

  if (typeof biggestColumn === 'string') {
    let sliceIndex = SLICE_SIZE
    values[bigColumnIndex] = `${biggestColumn.slice(0, sliceIndex)}'`
    index = 0
    const SQLQueries = [
      `INSERT INTO ${collection.tableName} VALUES (${'?, '.repeat(values.length).slice(0, -2)});`.replace(/\?/g, () => values[index++] as string),
    ]
    while (sliceIndex < biggestColumn.length) {
      const newSlice = `'${biggestColumn.slice(sliceIndex, sliceIndex + SLICE_SIZE)}` + (sliceIndex + SLICE_SIZE < biggestColumn.length ? '\'' : '')
      SQLQueries.push(
        `UPDATE ${collection.tableName} SET ${bigColumnName} = CONCAT(${bigColumnName}, ${newSlice}) WHERE id = ${values[0]};`,
      )
      sliceIndex += SLICE_SIZE
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
  const sortedKeys = getOrderedSchemaKeys((collection.extendedSchema).shape)
  const sqlFields = sortedKeys.map((key) => {
    const type = (collection.extendedSchema).shape[key]!
    const underlyingType = getUnderlyingType(type)

    if (key === 'id') return `${key} TEXT PRIMARY KEY`

    let sqlType: string = ZodToSqlFieldTypes[underlyingType.constructor.name as ZodFieldType]

    // Convert nested objects to TEXT
    if (JSON_FIELDS_TYPES.includes(underlyingType.constructor.name)) {
      sqlType = 'TEXT'
    }

    if (!sqlType) throw new Error(`Unsupported Zod type: ${underlyingType.constructor.name}`)

    // Handle string length
    if (underlyingType.constructor.name === 'ZodString') {
      const checks = (underlyingType._def as ZodStringDef).checks || []
      if (checks.some(check => check.kind === 'max')) {
        sqlType += `(${checks.find(check => check.kind === 'max')?.value})`
      }
    }

    // Handle optional fields
    const constraints = [
      type.isNullable() ? ' NULL' : '',
    ]

    // Handle default values
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

  // add __hash__ field for inserts
  sqlFields.push('"__hash__" TEXT UNIQUE')

  let definition = `CREATE TABLE IF NOT EXISTS ${collection.tableName} (${sqlFields.join(', ')});`

  if (opts.drop) {
    definition = `DROP TABLE IF EXISTS ${collection.tableName};\n${definition}`
  }

  return definition
}
