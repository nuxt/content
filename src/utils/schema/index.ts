import type { Draft07, EditorOptions, ContentConfig, ContentStandardSchemaV1, Draft07Definition, Draft07DefinitionProperty } from '../../types'
import { resolveModule, useNuxt } from '@nuxt/kit'
import { getComponentMeta } from 'nuxt-component-meta/parser'
import { propsToJsonSchema } from 'nuxt-component-meta/utils'

export * from './definitions'

type Property<T> = T & {
  editor: (opts: EditorOptions) => Property<T>
  markdown: () => Property<T>
  inherit: (componentPath: string) => Property<T>
}

export function property<T extends ContentStandardSchemaV1>(input: T): Property<T> {
  const $content = {} as ContentConfig

  const attachContent = (schema: ContentStandardSchemaV1) => {
    if (!schema) return
    const vendor = detectSchemaVendor(schema)

    switch (vendor) {
      case 'valibot':
        schema.$content = $content
        return
      case 'zod4':
        (schema as unknown as { def: { $content: ContentConfig } }).def.$content = $content
        return
      case 'zod3':
        (schema as unknown as { _def: { $content: ContentConfig } })._def.$content = $content
        return
    }
  }

  attachContent(input)

  const createProxy = (target: unknown): Property<T> =>
    new Proxy(target as object, {
      get(_target, prop, receiver) {
        if (prop === 'editor') {
          return (opts: EditorOptions) => {
            // merge editor options
            const current = $content.editor || {}
            $content.editor = { ...current, ...opts }
            return receiver
          }
        }
        // if (prop === 'markdown') {
        //   return () => {
        //     $content.markdown = true
        //     return receiver
        //   }
        // }
        if (prop === 'inherit') {
          return (componentPath: string) => {
            $content.inherit = componentPath
            return receiver
          }
        }

        const value = Reflect.get(_target, prop, receiver)

        if (typeof value === 'function') {
          return (...args: unknown[]) => value.apply(_target, args)
        }

        return value
      },
    }) as unknown as Property<T>

  return createProxy(input)
}

export function getEnumValues<T extends Record<string, unknown>>(obj: T) {
  return Object.values(obj) as [(typeof obj)[keyof T]]
}

export function mergeStandardSchema(s1: Draft07, s2: Draft07): Draft07 {
  return {
    $schema: s1.$schema,
    $ref: s1.$ref,
    definitions: Object.fromEntries(
      Object.entries(s1.definitions).map(([key, def1]) => {
        const def2 = s2.definitions[key]
        if (!def2) return [key, def1]

        return [key, {
          ...def1,
          properties: { ...def1.properties, ...def2.properties },
          required: [...new Set([...def1.required, ...(def2.required || [])])],
        }]
      }),
    ),
  }
}

export function detectSchemaVendor(schema: ContentStandardSchemaV1) {
  if (schema['~standard']?.vendor === 'valibot') {
    return 'valibot'
  }

  if (schema['~standard']?.vendor === 'zod') {
    return (schema as unknown as Record<string, unknown>).def ? 'zod4' : 'zod3'
  }

  return 'unknown'
}

export function replaceComponentSchemas<T = Draft07Definition | Draft07DefinitionProperty>(property: T): T {
  if ((property as Draft07DefinitionProperty).type === 'array' && (property as Draft07DefinitionProperty).items) {
    (property as Draft07DefinitionProperty).items = replaceComponentSchemas((property as Draft07DefinitionProperty).items as Draft07DefinitionProperty) as Draft07DefinitionProperty
  }

  if ((property as Draft07DefinitionProperty).type !== 'object') {
    return property
  }
  // If the property has a `$content.inherit` property, replace it with the component's props schema
  const $content = (property as Draft07DefinitionProperty).$content as ContentConfig

  if ($content?.inherit) {
    const nuxt = useNuxt()
    let path = String($content?.inherit)
    try {
      path = resolveModule(path, { paths: [nuxt.options.rootDir] })
    }
    catch {
      // Ignore error
    }

    const meta = getComponentMeta(path, { rootDir: nuxt.options.rootDir, cache: true })
    const schema = propsToJsonSchema(meta.props) as T

    return {
      ...schema,
      required: [...((schema as Draft07DefinitionProperty).required || []), ...(property as Draft07DefinitionProperty).required || []],
      properties: {
        ...(schema as Draft07DefinitionProperty).properties,
        ...(property as Draft07DefinitionProperty).properties,
      },
      additionalProperties: (schema as Draft07DefinitionProperty).additionalProperties
        || (property as Draft07DefinitionProperty).additionalProperties
        || false,
    }
  }

  // Look for `$content.inherit` properties in nested objects
  if ((property as Draft07Definition).properties) {
    Object.entries((property as Draft07Definition).properties).forEach(([key, value]) => {
      (property as Draft07Definition).properties![key] = replaceComponentSchemas(value as Draft07DefinitionProperty) as Draft07DefinitionProperty
    })
  }

  return property as T
}
