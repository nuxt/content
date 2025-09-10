import type { Draft07, Draft07DefinitionProperty, Draft07DefinitionPropertyAllOf, Draft07DefinitionPropertyAnyOf } from '@nuxt/content'

const propertyTypes = {
  string: 'VARCHAR',
  number: 'INT',
  boolean: 'BOOLEAN',
  date: 'DATE',
  enum: 'VARCHAR',
  object: 'TEXT',
}

export function getOrderedSchemaKeys(schema: Draft07) {
  const shape = Object.values(schema.definitions)[0]?.properties || {}
  const keys = new Set([
    shape.id ? 'id' : undefined,
    shape.title ? 'title' : undefined,
    ...Object.keys(shape).sort(),
  ].filter(Boolean))

  return Array.from(keys) as string[]
}

function isJSONProperty(property: Draft07DefinitionProperty | Draft07DefinitionPropertyAllOf | Draft07DefinitionPropertyAnyOf) {
  const propertyType = (property as Draft07DefinitionProperty).type
  return propertyType === 'object'
    || propertyType === 'array'
    || !!(property as Draft07DefinitionPropertyAnyOf).anyOf
    || !!(property as Draft07DefinitionPropertyAllOf).allOf
}

function getPropertyType(property: Draft07DefinitionProperty | Draft07DefinitionPropertyAllOf | Draft07DefinitionPropertyAnyOf) {
  const propertyType = (property as Draft07DefinitionProperty).type
  let type = propertyTypes[propertyType as keyof typeof propertyTypes] || 'TEXT'

  if ((property as Draft07DefinitionProperty).format === 'date-time') {
    type = 'DATE'
  }

  if ((property as Draft07DefinitionPropertyAllOf).allOf) {
    type = 'TEXT'
  }

  if ((property as Draft07DefinitionPropertyAnyOf).anyOf) {
    type = 'TEXT'

    const anyOf = (property as Draft07DefinitionPropertyAnyOf).anyOf
    const nullIndex = anyOf.findIndex(t => t.type === 'null')
    if (anyOf.length === 2 && nullIndex !== -1) {
      type = nullIndex === 0
        ? getPropertyType(anyOf[1]!)
        : getPropertyType(anyOf[0]!)
    }
  }

  if (Array.isArray(propertyType) && propertyType.includes('null') && propertyType.length === 2) {
    type = propertyType[0] === 'null'
      ? propertyTypes[propertyType[1] as keyof typeof propertyTypes] || 'TEXT'
      : propertyTypes[propertyType[0] as keyof typeof propertyTypes] || 'TEXT'
  }

  return type
}

export function describeProperty(schema: Draft07, property: string) {
  const def = Object.values(schema.definitions)[0]
  const shape = def?.properties || {}
  if (!shape[property]) {
    throw new Error(`Property ${property} not found in schema`)
  }

  const type = (shape[property] as Draft07DefinitionProperty).type

  const result: { name: string, sqlType: string, type?: string, default?: unknown, nullable: boolean, maxLength?: number, enum?: string[], json?: boolean } = {
    name: property,
    sqlType: getPropertyType(shape[property]),
    type,
    nullable: false,
    maxLength: (shape[property] as Draft07DefinitionProperty).maxLength,
    enum: (shape[property] as Draft07DefinitionProperty).enum,
    json: isJSONProperty(shape[property]),
  }
  if ((shape[property] as Draft07DefinitionPropertyAnyOf).anyOf) {
    if (((shape[property] as Draft07DefinitionPropertyAnyOf).anyOf).find(t => t.type === 'null')) {
      result.nullable = true
    }
  }

  if (Array.isArray(type) && type.includes('null')) {
    result.nullable = true
  }

  // default value
  if ('default' in shape[property]) {
    result.default = shape[property].default
  }
  else if (!def?.required.includes(property)) {
    result.nullable = true
  }

  return result
}

export function getCollectionFieldsTypes(schema: Draft07) {
  const sortedKeys = getOrderedSchemaKeys(schema)
  return sortedKeys.reduce((acc, key) => {
    const property = describeProperty(schema, key)
    if (property.json) {
      acc[key] = 'json'
    }
    else if (property.sqlType === 'BOOLEAN') {
      acc[key] = 'boolean'
    }
    else if (property.sqlType === 'DATE') {
      acc[key] = 'date'
    }
    else if (property.sqlType === 'INT') {
      acc[key] = 'number'
    }
    else {
      acc[key] = 'string'
    }
    return acc
  }, {} as Record<string, 'string' | 'number' | 'boolean' | 'date' | 'json'>)
}
