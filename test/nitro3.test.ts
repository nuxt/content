import { existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

// Each fixture is installed on its own with `pnpm install --dir test/fixtures/<fixture>`; CI always does.
describe.each(['nuxt5', 'nuxt4-nitro3'])('%s', (fixture) => {
  const rootDir = fileURLToPath(new URL(`./fixtures/${fixture}`, import.meta.url))
  const nuxtBin = `${rootDir}/node_modules/nuxt/bin/nuxt.mjs`

  // NUXT_B9001: the module sets a `nitro` option Nitro v3 ignores.
  // NUXT_B9002: the module registers a handler without the `route` Nitro v3 requires.
  // NUXT_B9003: the module's server code imports Nitro v2 (`nitropack`, `#imports`), so Nuxt runs it through its compatibility layer.
  it.skipIf(!existsSync(nuxtBin) && !process.env.CI).each(['prepare', 'build'])('%s runs without the Nitro v2 compatibility layer', async (command) => {
    const { stdout, stderr } = await promisify(execFile)(process.execPath, [nuxtBin, command], { cwd: rootDir })
    expect(stdout + stderr).not.toMatch(/NUXT_B900[123]/)
  }, 120_000)
})
