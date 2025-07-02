import { defu } from 'defu'
import type { JSType, Schema, InputValue } from 'untyped'

export type ConfigInputsTypes
  = | Exclude<JSType, 'symbol' | 'function' | 'any' | 'bigint'>
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
      '@previewInput string',
    ],
  },
  string: {
    type: 'string',
    tags: [
      '@previewInput string',
    ],
  },
  number: {
    type: 'number',
    tags: [
      '@previewInput number',
    ],
  },
  boolean: {
    type: 'boolean',
    tags: [
      '@previewInput boolean',
    ],
  },
  array: {
    type: 'array',
    tags: [
      '@previewInput array',
    ],
  },
  object: {
    type: 'object',
    tags: [
      '@previewInput object',
    ],
  },
  file: {
    type: 'string',
    tags: [
      '@previewInput file',
    ],
  },
  media: {
    type: 'string',
    tags: [
      '@previewInput media',
    ],
  },
  component: {
    type: 'string',
    tags: [
      '@previewInput component',
    ],
  },
  icon: {
    type: 'string',
    tags: [
      '@previewInput icon',
    ],
  },
}

export type PreviewFieldData
  = PartialSchema
    & {
      type?: keyof typeof supportedFields
      icon?: string
      fields?: { [key: string]: InputValue }
    }

/**
 * Helper to build preview compatible configuration schema.
 */
export function field(schema: PreviewFieldData): InputValue {
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
    result.tags.push(`@previewIcon ${result.icon}`)
    delete result.icon
  }
  return {
    $schema: result,
  }
}

export function group(schema: PreviewFieldData): InputValue {
  const result = { ...schema }

  if (result.icon) {
    result.tags = [`@previewIcon ${result.icon}`]
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
