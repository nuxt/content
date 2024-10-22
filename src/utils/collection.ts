import { join } from 'node:path'
import { pascalCase } from 'scule'
import type { ZodObject, ZodOptionalDef, ZodRawShape, ZodStringDef, ZodType } from 'zod'
import type { Collection, ResolvedCollection, CollectionSource, DefinedCollection, ResolvedCollectionSource } from '../types/collection'
import { getTableName } from '../runtime/internal/app'
import { metaSchema, pageSchema } from './schema'
import type { ZodFieldType } from './zod'
import { getUnderlyingType, ZodToSqlFieldTypes, z } from './zod'
import { downloadRepository, parseGitHubUrl } from './git'
import { logger } from './dev'

interface ResovleOptions {
  rootDir: string
}

const JSON_FIELDS_TYPES = ['ZodObject', 'ZodArray', 'ZodRecord', 'ZodIntersection', 'ZodUnion', 'ZodAny']

export function defineCollection<T extends ZodRawShape>(collection: Collection<T>): DefinedCollection {
  let schema = collection.schema || z.object({})
  if (collection.type === 'page') {
    schema = pageSchema.extend((schema as ZodObject<ZodRawShape>).shape)
  }

  schema = metaSchema.extend((schema as ZodObject<ZodRawShape>).shape)

  return {
    type: collection.type,
    source: collection.source,
    schema: collection.schema || z.object({}),
    extendedSchema: schema,
  }
}

export function resolveCollection(name: string, collection: DefinedCollection, opts: ResovleOptions): ResolvedCollection | undefined {
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
    pascalName: pascalCase(name),
    source: resolveSource(collection.source, opts),
    tableName: getTableName(name),
    tableDefinition: generateCollectionTableDefinition(name, collection, { drop: true }),
    generatedFields: {
      raw: typeof collection.schema.shape.raw !== 'undefined',
      body: typeof collection.schema.shape.body !== 'undefined',
      path: typeof collection.schema.shape.path !== 'undefined',
    },
    jsonFields: Object.keys(collection.extendedSchema.shape || {})
      .filter(key => JSON_FIELDS_TYPES
        .includes(getUnderlyingType(collection.extendedSchema.shape[key]).constructor.name)),
  }
}

export function resolveCollections(collections: Record<string, DefinedCollection>, opts: ResovleOptions): ResolvedCollection[] {
  collections._info = defineCollection({
    type: 'data',
    schema: z.object({
      version: z.string(),
    }),
  })

  return Object.entries(collections)
    .map(([name, collection]) => resolveCollection(name, collection, opts))
    .filter(Boolean) as ResolvedCollection[]
}

/**
 * Process collection source and return refined source
 */
function resolveSource(source: string | CollectionSource | undefined, opts: ResovleOptions): ResolvedCollectionSource | undefined {
  if (!source) {
    return undefined
  }

  const result: ResolvedCollectionSource = {
    cwd: '',
    ...(typeof source === 'string' ? { path: source } : source),
  }

  const repository = result?.repository && parseGitHubUrl(result.repository!)
  if (repository) {
    const { org, repo, branch } = repository
    result.cwd = join(opts.rootDir, '.data', 'content', `github-${org}-${repo}-${branch}`)

    result.prepare = async () => {
      await downloadRepository(
        `https://github.com/${org}/${repo}/archive/refs/heads/${branch}.tar.gz`,
        result.cwd!,
      )
    }
  }

  result.cwd = result.cwd || join(opts.rootDir, 'content')

  return result
}

export function parseSourceBase(source: CollectionSource) {
  const [fixPart, ...rest] = source.path.includes('*') ? source.path.split('*') : ['', source.path]
  return {
    fixed: fixPart || '',
    dynamic: '*' + rest.join('*'),
  }
}

// Convert collection data to SQL insert statement
export function generateCollectionInsert(collection: ResolvedCollection, data: Record<string, unknown>) {
  const fields: string[] = []
  const values: Array<string | number | boolean> = []
  const sortedKeys = Object.keys((collection.extendedSchema).shape).sort()

  sortedKeys.forEach((key) => {
    const value = (collection.extendedSchema).shape[key]
    const underlyingType = getUnderlyingType(value as ZodType<unknown, ZodOptionalDef>)

    const defaultValue = value._def.defaultValue ? value._def.defaultValue() : 'NULL'
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
export function generateCollectionTableDefinition(name: string, collection: DefinedCollection, opts: { drop?: boolean } = {}) {
  const sortedKeys = Object.keys((collection.extendedSchema).shape).sort()
  const sqlFields = sortedKeys.map((key) => {
    const type = (collection.extendedSchema).shape[key]
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
      const defaultValue = typeof type._def.defaultValue() === 'string'
        ? `'${type._def.defaultValue()}'`
        : type._def.defaultValue()
      constraints.push(`DEFAULT ${defaultValue}`)
    }

    return `"${key}" ${sqlType}${constraints.join(' ')}`
  })

  let definition = `CREATE TABLE IF NOT EXISTS ${getTableName(name)} (${sqlFields.join(', ')});`

  if (opts.drop) {
    definition = `DROP TABLE IF EXISTS ${getTableName(name)};\n${definition}`
  }

  return definition
}
