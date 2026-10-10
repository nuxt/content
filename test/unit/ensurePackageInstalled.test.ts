import { afterEach, describe, expect, test, vi } from 'vitest'

const logger = { error: vi.fn(), warn: vi.fn(), prompt: vi.fn() }
const addDependency = vi.fn()

vi.mock('../../src/utils/dev', () => ({ logger }))
vi.mock('nypm', () => ({ addDependency }))

describe('ensurePackageInstalled', () => {
  afterEach(() => {
    vi.clearAllMocks()
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

  test('continues when the package manager exits non-zero but the package was installed', async () => {
    // pnpm >= 10 adds the package, then exits with ERR_PNPM_IGNORED_BUILDS
    vi.doMock('std-env', async importOriginal => ({
      ...(await importOriginal<typeof import('std-env')>()),
      hasTTY: true,
      isCI: false,
    }))
    vi.doMock('pkg-types', () => ({
      resolvePackageJSON: vi.fn()
        .mockRejectedValueOnce(new Error('Cannot find module'))
        .mockResolvedValue('/project/node_modules/better-sqlite3/package.json'),
    }))
    logger.prompt.mockResolvedValueOnce(true)
    addDependency.mockRejectedValueOnce(new Error('pnpm add better-sqlite3 failed.'))
    const { ensurePackageInstalled } = await import('../../src/utils/dependencies')

    await expect(ensurePackageInstalled('better-sqlite3')).resolves.toBeUndefined()

    expect(addDependency).toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('better-sqlite3'))
  })

  test('rethrows when the package manager fails and the package is still missing', async () => {
    vi.doMock('std-env', async importOriginal => ({
      ...(await importOriginal<typeof import('std-env')>()),
      hasTTY: true,
      isCI: false,
    }))
    vi.doMock('pkg-types', () => ({
      resolvePackageJSON: vi.fn().mockRejectedValue(new Error('Cannot find module')),
    }))
    logger.prompt.mockResolvedValueOnce(true)
    const error = new Error('pnpm add better-sqlite3 failed.')
    addDependency.mockRejectedValueOnce(error)
    const { ensurePackageInstalled } = await import('../../src/utils/dependencies')

    await expect(ensurePackageInstalled('better-sqlite3')).rejects.toBe(error)
  })
})
