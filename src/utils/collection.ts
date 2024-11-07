import type { ZodObject, ZodOptionalDef, ZodRawShape, ZodStringDef, ZodType } from 'zod'
import type { Collection, ResolvedCollection, CollectionSource, DefinedCollection, ResolvedCollectionSource } from '../types/collection'
import { defineLocalSource, defineGitHubSource } from './source'
import { metaSchema, pageSchema } from './schema'
import type { ZodFieldType } from './zod'
import { getUnderlyingType, ZodToSqlFieldTypes, z, getUnderlyingTypeName } from './zod'
import { logger } from './dev'

const JSON_FIELDS_TYPES = ['ZodObject', 'ZodArray', 'ZodRecord', 'ZodIntersection', 'ZodUnion', 'ZodAny']

function getTableName(name: string) {
  return `content_${name}`
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
    jsonFields: Object.keys(schema.shape)
      .filter(key => JSON_FIELDS_TYPES
        .includes(getUnderlyingTypeName(schema.shape[key as keyof typeof schema.shape]))),
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
    private: name === '_info',
  }
}

export function resolveCollections(collections: Record<string, DefinedCollection>): ResolvedCollection[] {
  collections._info = defineCollection({
    type: 'data',
    schema: z.object({
      version: z.string(),
    }),
  })

  return Object.entries(collections)
    .map(([name, collection]) => resolveCollection(name, collection))
    .filter(Boolean) as ResolvedCollection[]
}

/**
 * Process collection source and return refined source
 */
function resolveSource(source: string | CollectionSource | undefined): ResolvedCollectionSource | undefined {
  if (!source) {
    return undefined
  }

  if (typeof source === 'string') {
    return defineLocalSource({ include: source })
  }

  if ((source as ResolvedCollectionSource)._resolved) {
    return source as ResolvedCollectionSource
  }

  if (source.repository) {
    return defineGitHubSource(source)
  }

  return defineLocalSource(source)
}

// Convert collection data to SQL insert statement
export function generateCollectionInsert(collection: ResolvedCollection, data: Record<string, unknown>) {
  const fields: string[] = []
  const values: Array<string | number | boolean> = []
  const sortedKeys = Object.keys((collection.extendedSchema).shape).sort()

  sortedKeys.forEach((key) => {
    const value = (collection.extendedSchema).shape[key]
    const underlyingType = getUnderlyingType(value as ZodType<unknown, ZodOptionalDef>)

    let defaultValue = value?._def.defaultValue ? value?._def.defaultValue() : 'NULL'

    if (!(defaultValue instanceof Date) && typeof defaultValue === 'object') {
      defaultValue = JSON.stringify(defaultValue)
    }
    const valueToInsert = typeof data[key] !== 'undefined' ? data[key] : defaultValue

    fields.push(key)
    if ((collection.jsonFields || []).includes(key)) {
      values.push(`'${JSON.stringify(valueToInsert).replace(/'/g, '\'\'')}'`)
    }
    else if (['ZodString', 'ZodEnum'].includes(underlyingType.constructor.name)) {
      values.push(`'${String(valueToInsert).replace(/\n/g, '\\n').replace(/'/g, '\'\'')}'`)
    }
    else if (['ZodDate'].includes(underlyingType.constructor.name)) {
      values.push(valueToInsert !== 'NULL' ? `'${new Date(valueToInsert as string).toISOString()}'` : defaultValue)
    }
    else if (underlyingType.constructor.name === 'ZodBoolean') {
      values.push(valueToInsert !== 'NULL' ? !!valueToInsert : valueToInsert)
    }
    else {
      values.push(valueToInsert)
    }
  })

  let index = 0

  return `INSERT INTO ${collection.tableName} VALUES (${'?, '.repeat(values.length).slice(0, -2)})`
    .replace(/\?/g, () => values[index++] as string)
}

// Convert a collection with Zod schema to SQL table definition
export function generateCollectionTableDefinition(collection: ResolvedCollection, opts: { drop?: boolean } = {}) {
  const sortedKeys = Object.keys((collection.extendedSchema).shape).sort()
  const sqlFields = sortedKeys.map((key) => {
    const type = (collection.extendedSchema).shape[key]!
    const underlyingType = getUnderlyingType(type)

    if (key === '_id') return `${key} TEXT PRIMARY KEY`

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

  let definition = `CREATE TABLE IF NOT EXISTS ${collection.tableName} (${sqlFields.join(', ')});`

  if (opts.drop) {
    definition = `DROP TABLE IF EXISTS ${collection.tableName};\n${definition}`
  }

  return definition
}
