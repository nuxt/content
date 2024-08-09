import { pascalCase } from 'scule'
import { z } from 'zod'
import type { ZodArrayDef, ZodObject, ZodOptionalDef, ZodRawShape, ZodStringDef, ZodType } from 'zod'
import type { Collection, ResolvedCollection } from '../types/collection'
import { contentSchema, pageSchema } from './schema'
import type { ZodFieldType } from './zod'
import { getUnderlyingType, ZodToSqlFieldTypes } from './zod'

export function defineCollection<T extends ZodRawShape>(collection: Collection<T>) {
  const schema = collection.schema
  return {
    ...collection,
    schema: collection.type === 'page' ? pageSchema.extend((schema as ZodObject<ZodRawShape>).shape) : schema,
  }
}

export function resolveCollections(collections: Record<string, Collection>): ResolvedCollection[] {
  if (!collections.content) {
    collections.content = defineCollection({
      type: 'page',
      source: {
        name: 'content',
        driver: 'fs',
        base: '~~/content',
      },
      schema: contentSchema,
    })
  }

  collections._info = defineCollection({
    type: 'data',
    source: {
      name: 'content',
      driver: 'fs',
      base: '~~/content',
    },
    schema: z.object({
      version: z.string(),
    }),
  })

  return Object.entries(collections).map(([key, collection]) => {
    return {
      ...collection,
      name: key,
      pascalName: pascalCase(key),
      source: collection.source,
      table: generateCollectionTableDefinition(key, collection),
      generatedFields: {
        raw: typeof collection.schema.shape.raw !== 'undefined',
        body: typeof collection.schema.shape.body !== 'undefined',
        path: typeof collection.schema.shape.path !== 'undefined',
      },
      jsonFields: Object.keys(collection.schema.shape)
        .filter(key => ['ZodObject', 'ZodArray', 'ZodRecord']
          .includes(collection.schema.shape[key].constructor.name)),
    }
  })
}

// Convert collection data to SQL insert statement
export function generateCollectionInsert(collection: ResolvedCollection, data: Record<string, unknown>) {
  const fields: string[] = []
  const values: Array<string | number | boolean> = []

  Object.entries((collection.schema).shape).forEach(([key, value]) => {
    const underlyingType = getUnderlyingType(value as ZodType<unknown, ZodOptionalDef>)

    fields.push(key)
    if ((collection.jsonFields || []).includes(key)) {
      values.push(data[key] ? `'${JSON.stringify(data[key]).replace(/'/g, '\'\'')}'` : 'NULL')
    }
    else if (underlyingType.constructor.name === 'ZodString' || underlyingType.constructor.name === 'ZodDate') {
      values.push(data[key] ? `'${String(data[key]).replace(/'/g, '\'\'')}'` : 'NULL')
    }
    else if (underlyingType.constructor.name === 'ZodBoolean') {
      values.push(data[key] ? true : false)
    }
    else {
      values.push(data[key] as string | number | boolean)
    }
  })

  let index = 0

  return `INSERT INTO ${collection.name} (${fields.join(', ')}) VALUES (${'?,'.repeat(fields.length).slice(0, -1)})`
    .replace(/\?/g, () => values[index++] as string)
}

// Convert a collection with Zod schema to SQL table definition
export function generateCollectionTableDefinition(name: string, collection: Collection) {
  const sqlFields = Object.entries(collection.schema.shape).map(([key, zodType]) => {
    const underlyingType = getUnderlyingType(zodType)

    // Convert nested objects to TEXT
    if (['ZodObject', 'ZodArray', 'ZodRecord'].includes(underlyingType.constructor.name)) {
      return `${key} TEXT`
    }

    let sqlType = ZodToSqlFieldTypes[underlyingType.constructor.name as ZodFieldType]
    if (!sqlType) throw new Error(`Unsupported Zod type: ${underlyingType.constructor.name}`)

    // Handle string length
    if (underlyingType.constructor.name === 'ZodString' && (underlyingType._def as ZodArrayDef).maxLength) {
      sqlType += `(${(underlyingType._def as ZodArrayDef).maxLength?.value})`
    }

    // Handle optional fields
    let constraints = ''
    if (zodType._def.innerType) {
      const _def = zodType._def.innerType._def as ZodStringDef
      if (_def.checks && _def.checks.some(check => check.kind === 'min')) {
        constraints += ' NOT NULL'
      }
      else {
        constraints += ' NULL'
      }
    }
    else {
      const _def = zodType._def as ZodStringDef
      if (_def.checks && _def.checks.some(check => check.kind === 'min')) {
        constraints += ' NOT NULL'
      }
      else {
        constraints += ' NULL'
      }
    }

    // Handle default values
    if (zodType._def.defaultValue !== undefined) {
      constraints += ` DEFAULT ${typeof zodType._def.defaultValue() === 'string' ? `'${zodType._def.defaultValue()}'` : zodType._def.defaultValue()}`
    }

    return `${key} ${sqlType}${constraints}`
  })

  return `CREATE TABLE IF NOT EXISTS ${name} (${sqlFields.join(',  ')})`
}
