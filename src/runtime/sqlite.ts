import { z } from 'zod'

export const contentSchema = z.object({
  _id: z.string(),
  _path: z.string(),
  _dir: z.string(),
  _draft: z.boolean().default(false),
  _partial: z.boolean().default(false),
  _locale: z.string(),
  title: z.string(),
  description: z.string(),
  navigation: z.boolean().default(true),
  body: z.object({
    type: z.string(),
    children: z.any(),
    toc: z.any(),
  }),
  _type: z.string(),
  _source: z.string(),
  _file: z.string(),
  _stem: z.string(),
  _extension: z.string(),
})

export const infoSchema = z.object({
  version: z.string(),
})

export function generateInsert(schema, tableName, data) {
  const fields = []
  const values = []

  Object.entries(schema.shape).forEach(([key, value]) => {
    const underlyingType = getUnderlyingType(value)

    fields.push(key)
    if (underlyingType.constructor.name === 'ZodObject') {
      values.push(JSON.stringify(data[key]))
    }
    else if (underlyingType.constructor.name === 'ZodString' || underlyingType.constructor.name === 'ZodDate') {
      values.push(`${data[key]}`)
    }
    else if (underlyingType.constructor.name === 'ZodBoolean') {
      values.push(data[key] ? true : false)
    }
    else {
      values.push(data[key])
    }
  })

  return {
    fields,
    values,
    prepareSql: `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${'?,'.repeat(fields.length).slice(0, -1)})`,
  }
}

// Function to get the underlying Zod type
function getUnderlyingType(zodType) {
  while (zodType._def.innerType) {
    zodType = zodType._def.innerType
  }
  return zodType
}

// Function to convert Zod schema to SQL table definition
export function zodToSQL(schema, tableName) {
  const fieldMappings = {
    ZodString: 'VARCHAR',
    ZodNumber: 'INT',
    ZodBoolean: 'BOOLEAN',
    ZodDate: 'DATE',
  }

  const sqlFields = Object.entries(schema.shape).map(([key, value]) => {
    const underlyingType = getUnderlyingType(value)

    // Convert nested objects to TEXT
    if (underlyingType.constructor.name === 'ZodObject') {
      return `${key} TEXT`
    }

    let sqlType = fieldMappings[underlyingType.constructor.name]
    if (!sqlType) throw new Error(`Unsupported Zod type: ${underlyingType.constructor.name}`)

    // Handle string length
    if (underlyingType.constructor.name === 'ZodString' && underlyingType._def.maxLength) {
      sqlType += `(${underlyingType._def.maxLength.value})`
    }

    // Handle optional fields
    let constraints = ''
    if (value._def.innerType) {
      if (value._def.innerType._def.checks && value._def.innerType._def.checks.some(check => check.kind === 'min')) {
        constraints += ' NOT NULL'
      }
      else {
        constraints += ' NULL'
      }
    }
    else {
      if (value._def.checks && value._def.checks.some(check => check.kind === 'min')) {
        constraints += ' NOT NULL'
      }
      else {
        constraints += ' NULL'
      }
    }

    // Handle default values
    if (value._def.defaultValue !== undefined) {
      constraints += ` DEFAULT ${typeof value._def.defaultValue() === 'string' ? `'${value._def.defaultValue()}'` : value._def.defaultValue()}`
    }

    return `${key} ${sqlType}${constraints}`
  })

  return `CREATE TABLE IF NOT EXISTS ${tableName} (${sqlFields.join(',  ')})`
}
