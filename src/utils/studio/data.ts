import { defu } from 'defu'
import type { JSType, Schema, InputValue } from 'untyped'

export type ConfigInputsTypes =
  | Exclude<JSType, 'symbol' | 'function' | 'any' | 'bigint'>
  | 'default' | 'icon' | 'file' | 'media' | 'component'

export type PickerTypes = 'media-picker' | 'icon-picker'

export type PartialSchema = Pick<Schema, 'title' | 'description' | 'default' | 'required'> & { [key: string]: unknown }

const supportedFields: { [key in ConfigInputsTypes]: Schema } = {
  /**
   * Raw types
   */
  default: {
    type: 'string',
    tags: [
      '@studioInput string',
    ],
  },
  string: {
    type: 'string',
    tags: [
      '@studioInput string',
    ],
  },
  number: {
    type: 'number',
    tags: [
      '@studioInput number',
    ],
  },
  boolean: {
    type: 'boolean',
    tags: [
      '@studioInput boolean',
    ],
  },
  array: {
    type: 'array',
    tags: [
      '@studioInput array',
    ],
  },
  object: {
    type: 'object',
    tags: [
      '@studioInput object',
    ],
  },
  file: {
    type: 'string',
    tags: [
      '@studioInput file',
    ],
  },
  media: {
    type: 'string',
    tags: [
      '@studioInput media',
    ],
  },
  component: {
    type: 'string',
    tags: [
      '@studioInput component',
    ],
  },
  icon: {
    type: 'string',
    tags: [
      '@studioInput icon',
    ],
  },
}

export type StudioFieldData =
  PartialSchema &
  {
    type?: keyof typeof supportedFields
    icon?: string
    fields?: { [key: string]: InputValue }
  }

/**
 * Helper to build Nuxt Studio compatible configuration schema.
 * Supports all type of fields provided by Nuxt Studio and all fields supported from Untyped Schema interface.
 */
export function field(schema: StudioFieldData): InputValue {
  if (!schema.type) {
    throw new Error(`Missing type in schema ${JSON.stringify(schema)}`)
  }

  // copy of supportedFields
  const base = JSON.parse(JSON.stringify(supportedFields[schema.type]))
  const result = defu(base, schema)

  if (!result.tags) {
    result.tags = []
  }
  if (result.icon) {
    result.tags.push(`@studioIcon ${result.icon}`)
    delete result.icon
  }
  return {
    $schema: result,
  }
}

export function group(schema: StudioFieldData): InputValue {
  const result = { ...schema }

  if (result.icon) {
    result.tags = [`@studioIcon ${result.icon}`]
    delete result.icon
  }

  const fields: Record<string, InputValue> = {}
  if (result.fields) {
    for (const key of Object.keys(result.fields)) {
      fields[key] = result.fields[key]
    }
    delete result.fields
  }

  return {
    $schema: result,
    ...fields,
  }
}
