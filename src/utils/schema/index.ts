import type { Draft07, EditorOptions, ContentConfig, ContentStandardSchemaV1 } from '../../types'

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
        // if (prop === 'inherit') {
        //   return (componentPath: string) => {
        //     $content.inherit = componentPath
        //     return receiver
        //   }
        // }

        const value = Reflect.get(_target, prop, receiver)

        if (typeof value === 'function') {
          return (...args: unknown[]) => {
            const result = value.apply(_target, args)
            // If method is chainable and returns a new schema, re-attach $content and re-wrap
            attachContent(result)
            return createProxy(result)
          }
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
