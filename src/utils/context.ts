import { createContext } from 'unctx'
import type { Draft07 } from '../types'

type ContextKey = 'zod3' | 'zod4' | 'valibot' | 'unknown'

// Stash the validators context on `globalThis` under a `Symbol.for` key so
// that any duplicate evaluations of this module (e.g. when jiti re-loads
// `@nuxt/content` while processing `content.config.ts` under pnpm's
// `enableGlobalVirtualStore`, where realpath differences break Node's ESM
// cache) share the same backing object. Without this, the second instance
// resets the context to its stub state and `toJSONSchema` throws even
// after the first instance detected zod/valibot.
const SINGLETON_KEY = Symbol.for('@nuxt/content:validators-context')

type SchemaHandler = { toJSONSchema: (schema: unknown, name: string) => Draft07 }

type NuxtContentContext = {
  zod3: SchemaHandler
  zod4: SchemaHandler
  valibot: SchemaHandler
  unknown: SchemaHandler
  set: (key: ContextKey, value: unknown) => void
  get: (key: ContextKey) => SchemaHandler
}

const nuxtContentContext: NuxtContentContext
  = ((globalThis as Record<symbol, unknown>)[SINGLETON_KEY] as NuxtContentContext | undefined) ?? (
    (globalThis as Record<symbol, unknown>)[SINGLETON_KEY] = {
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
    } satisfies NuxtContentContext
  ) as NuxtContentContext

const ctx = createContext<typeof nuxtContentContext>()
ctx.set(nuxtContentContext)

export default ctx.use
