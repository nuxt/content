import { pathToFileURL } from 'url'
import type { RequestListener } from 'http'
import { resolve } from 'pathe'
import { listen } from 'listhen'
// @ts-ignore
import { $fetch } from 'ohmyfetch/node'
// @ts-ignore
import { execa } from 'execa'
import type { Listener } from 'listhen'
import { fixtureDir } from './utils.js'

interface TestOptions {
  fixture: string
  server?: boolean | string
}

interface TestContext {
  rootDir: string
  outDir: string
  fetch: <T = unknown>(url: string, opts?: any) => Promise<T>
  server?: Listener
  _init: () => Promise<void>
  _destroy: () => Promise<void>
}

export function importModule(path: string) {
  return import(pathToFileURL(path).href)
}

export function setupTest(options: TestOptions) {
  const rootDir = fixtureDir(options.fixture)
  const buildDir = resolve(rootDir, '.nuxt')

  const ctx: TestContext = {
    rootDir,
    outDir: resolve(rootDir, '.output'),
    fetch: <T>(_url: string, _opts?: any) => Promise.resolve(undefined as unknown as T),
    _init: async () => {
      await execa('npx', ['nuxi', 'build', ctx.rootDir], {
        env: {
          NITRO_PRESET: 'node',
          NITRO_BUILD_DIR: buildDir,
          NITRO_OUTPUT_DIR: ctx.outDir,
          NODE_ENV: 'production'
        }
      })

      if (options.server) {
        if (options.server === 'http') {
          const { handle } = await importModule(resolve(ctx.outDir, 'server/index.mjs'))
          await startServer(ctx, handle)
          ctx.fetch = <T = unknown>(url: string, opts?: any) => $fetch<T>(url, { baseURL: ctx.server?.url, ...opts })
        } else {
          const { $fetch } = await importModule(resolve(ctx.outDir, 'server/index.mjs'))
          ctx.fetch = $fetch
        }
      }
    },
    _destroy: async () => {
      if (ctx.server) {
        await ctx.server.close()
      }
    }
  }

  return ctx
}

export async function startServer(ctx: TestContext, handle: RequestListener) {
  ctx.server = await listen(handle)
}
