import { afterEach, describe, expect, test, vi } from 'vitest'

const logger = { error: vi.fn(), prompt: vi.fn() }
const addDependency = vi.fn()

vi.mock('../../src/utils/dev', () => ({ logger }))
vi.mock('nypm', () => ({ addDependency }))

describe('ensurePackageInstalled', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  test('reports how to install the package instead of prompting when there is no TTY', async () => {
    vi.doMock('std-env', async importOriginal => ({
      ...(await importOriginal<typeof import('std-env')>()),
      hasTTY: false,
      isCI: false,
    }))
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    const { ensurePackageInstalled } = await import('../../src/utils/dependencies')

    await ensurePackageInstalled('@nuxt/content-not-installed')

    expect(logger.prompt).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenLastCalledWith(expect.stringContaining('npm install @nuxt/content-not-installed'))
    expect(exit).toHaveBeenCalledWith(1)
  })

  test('reports how to install the package instead of prompting in CI', async () => {
    vi.doMock('std-env', async importOriginal => ({
      ...(await importOriginal<typeof import('std-env')>()),
      hasTTY: true,
      isCI: true,
    }))
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    const { ensurePackageInstalled } = await import('../../src/utils/dependencies')

    await ensurePackageInstalled('@nuxt/content-not-installed')

    expect(logger.prompt).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenLastCalledWith(expect.stringContaining('npm install @nuxt/content-not-installed'))
    expect(exit).toHaveBeenCalledWith(1)
  })

  test('prompts to install the package when interactive and not in CI', async () => {
    vi.doMock('std-env', async importOriginal => ({
      ...(await importOriginal<typeof import('std-env')>()),
      hasTTY: true,
      isCI: false,
    }))
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    const { ensurePackageInstalled } = await import('../../src/utils/dependencies')

    await ensurePackageInstalled('@nuxt/content-not-installed')

    expect(logger.prompt).toHaveBeenCalled()
  })
})
