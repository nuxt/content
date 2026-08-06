import { describe, expect, test, vi } from 'vitest'

const converter = vi.hoisted(() => ({ loaded: vi.fn() }))

vi.mock('zod-to-json-schema', async (importOriginal) => {
  converter.loaded()
  return await importOriginal<typeof import('zod-to-json-schema')>()
})

describe('validator lazy loading', () => {
  test('loads zod-to-json-schema only when the zod3 validator is initialized', async () => {
    await import('../../src/utils/index.ts')

    expect(converter.loaded).not.toHaveBeenCalled()

    const { initiateValidatorsContext } = await import('../../src/utils/dependencies.ts')
    await initiateValidatorsContext()

    expect(converter.loaded).toHaveBeenCalled()
  })
})
