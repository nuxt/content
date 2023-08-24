import { fileURLToPath } from 'url'
import { test, describe, expect } from 'vitest'
import { setup } from '@nuxt/test-utils'

describe('Building with custom driver', async () => {
  let builds: boolean
  try {
    await setup({
      rootDir: fileURLToPath(new URL('./fixtures/custom-driver', import.meta.url)),
      server: true,
      dev: false
    })
    builds = true
  } catch {
    builds = false
  }

  test('Builds succeeds', () => {
    expect(builds).toBe(true)
  })
})
