import { createContext } from 'unctx'

type ContextKey = 'zod3' | 'zod4' | 'valibot' | 'unknown'

const nuxtContentContext = {
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
  set: (key: ContextKey, value: unknown) => {
    nuxtContentContext[key] = value as typeof nuxtContentContext[ContextKey]
  },
  get: (key: ContextKey) => {
    return nuxtContentContext[key]
  },
}

const ctx = createContext<typeof nuxtContentContext>()
ctx.set(nuxtContentContext)

export default ctx.use
