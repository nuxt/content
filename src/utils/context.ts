import { getContext } from 'unctx'
import type { Draft07 } from '../types'

type ContextKey = 'zod3' | 'zod4' | 'valibot' | 'unknown'

type SchemaHandler = { toJSONSchema: (schema: unknown, name: string) => Draft07 }

type NuxtContentContext = {
  zod3: SchemaHandler
  zod4: SchemaHandler
  valibot: SchemaHandler
  unknown: SchemaHandler
  set: (key: ContextKey, value: unknown) => void
  get: (key: ContextKey) => SchemaHandler
}

const ctx = getContext<NuxtContentContext>('@nuxt/content:validators-context')

/**
 * Initialize the context if it hasn't been set yet.
 */
if (!ctx.tryUse()) {
  ctx.set({
    zod3: {
      toJSONSchema: (_schema: unknown, _name: string) => {
        throw new Error(
          'It seems you are using Zod version 3 for collection schema, but Zod is not installed, '
          + 'Nuxt Content does not ship with zod, install `zod` and `zod-to-json-schema` and it will work.',
        )
      },
    },
    zod4: {
      toJSONSchema: (_schema: unknown, _name: string) => {
        throw new Error(
          'It seems you are using Zod version 4 for collection schema, but Zod is not installed, '
          + 'Nuxt Content does not ship with zod, install `zod` and it will work.',
        )
      },
    },
    valibot: {
      toJSONSchema: (_schema: unknown, _name: string) => {
        throw new Error(
          'It seems you are using Valibot for collection schema, but Valibot is not installed, '
          + 'Nuxt Content does not ship with valibot, install `valibot` and `@valibot/to-json-schema` and it will work.',
        )
      },
    },
    unknown: {
      toJSONSchema: (_schema: unknown, _name: string) => {
        throw new Error('Unknown schema vendor')
      },
    },
    set(key: ContextKey, value: unknown) {
      (this as unknown as Record<ContextKey, unknown>)[key] = value
    },
    get(key: ContextKey) {
      return (this as unknown as Record<ContextKey, SchemaHandler>)[key]
    },
  })
}

export default ctx.use
