import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { z } from 'zod'

const SINGLETON_KEY = Symbol.for('@nuxt/content:validators-context')

function resetValidatorsContext() {
  Reflect.deleteProperty(globalThis as Record<symbol, unknown>, SINGLETON_KEY)
}

describe('validator registry', () => {
  beforeEach(() => {
    vi.resetModules()
    resetValidatorsContext()
  })

  afterEach(() => {
    resetValidatorsContext()
  })

  test('preserves initialized validators across duplicate module evaluations', async () => {
    const { initiateValidatorsContext } = await import('../../src/utils/dependencies.ts?deps=primary')
    await initiateValidatorsContext()

    const { default: useContextA } = await import('../../src/utils/context.ts?ctx=a')
    const { default: useContextB } = await import('../../src/utils/context.ts?ctx=b')

    const contextA = useContextA()
    const contextB = useContextB()

    expect(contextA).toBe(contextB)
    expect(() => contextB.get('zod3').toJSONSchema(z.object({ title: z.string() }), '__SCHEMA__')).not.toThrow()
  })
})
