import type { StandardSchemaV1 } from '@standard-schema/spec'

export interface Draft07 {
  $schema: 'http://json-schema.org/draft-07/schema#'
  $ref: string
  definitions: Record<string, Draft07Definition>
}

export interface Draft07Definition {
  type: string
  properties: Record<string, Draft07DefinitionProperty | Draft07DefinitionPropertyAnyOf | Draft07DefinitionPropertyAllOf | Draft07DefinitionPropertyOneOf>
  required: string[]
  additionalProperties: boolean
}

export interface Draft07DefinitionProperty {
  type?: string // missing type means any
  items?: Draft07DefinitionProperty
  properties?: Record<string, Draft07DefinitionProperty>
  required?: string[]
  default?: unknown
  maxLength?: number
  format?: string
  enum?: string[]
  additionalProperties?: boolean | Record<string, Draft07DefinitionProperty>
  $content?: {
    editor?: EditorOptions
  }
}

export interface Draft07DefinitionPropertyAnyOf {
  anyOf: Draft07DefinitionProperty[]
}

export interface Draft07DefinitionPropertyAllOf {
  allOf: Draft07DefinitionProperty[]
}

export interface Draft07DefinitionPropertyOneOf {
  oneOf: Draft07DefinitionProperty[]
}

export interface ContentConfig {
  editor?: EditorOptions
  // markdown?: boolean
  inherit?: string
}

export interface EditorOptions {
  input?: 'media' | 'icon' | 'textarea' | 'relation' // Override the default input for the field
  hidden?: boolean // Do not display the field in the editor
  iconLibraries?: string[] // List of icon libraries to use for the icon input
  relation?: RelationOptions // Collection referenced by the field, for the relation input
  label?: string // Override auto-generated label with a custom one
  description?: string // When defined, set a description for the field
  tooltip?: string // When defined, set a tooltip info-bubble next to the label
}

export interface RelationOptions {
  collection: string // Name of the referenced collection, as declared in the content config
  valueField?: 'slug' | 'path' | 'stem' | (string & {}) // Field of the referenced document written to the file, defaults to `slug` (its file name)
  labelField?: string // Field of the referenced document displayed in the editor, defaults to `name` then `title`
}

export interface ContentStandardSchemaV1<Input = unknown, Output = Input> extends StandardSchemaV1<Input, Output> {
  $content?: ContentConfig
}
