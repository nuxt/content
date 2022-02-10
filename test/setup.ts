import type { RequestListener } from 'http'
import { resolve } from 'pathe'
import { listen } from 'listhen'
import { $fetch } from 'ohmyfetch'
import { execa } from 'execa'
import type { Listener } from 'listhen'
import { fixtureDir } from './utils.js'

interface TestOptions {
  /**
   * The fixture to build resolved path
   */
  fixture: string
  /**
   * Server toggle or type
   */
  server?: boolean | 'http'
}

interface TestContext {
  /**
   * Nuxt fixture directory
   */
  rootDir: string
  /**
   * Server build output directory
   */
  outDir: string
  /**
   * $fetch from Nuxt server or OhMyFetch equivalent if server runs in HTTP mode.
   */
  fetch: <T = unknown>(url: string, opts?: any) => Promise<T>
  /**
   * Listhen server listener
   */
  server?: Listener
  /**
   * Init TestContext environment
   */
  _init: () => Promise<void>
  /**
   * Closes Nuxt server
   */
  _destroy: () => Promise<void>
}

export function importModule (path: string) {
  // return import(pathToFileURL(path).href)
  return import(path)
}

export function setupTest (options: TestOptions) {
  const rootDir = fixtureDir(options.fixture)
  const buildDir = resolve(rootDir, '.nuxt')

  const ctx: TestContext = {
    rootDir,
    outDir: resolve(rootDir, '.output'),
    fetch: <T>(_url: string, _opts?: any) => Promise.resolve(undefined as unknown as T),
    _init: async () => {
      // Build Nuxt server
      await execa('npx', ['nuxi', 'build', ctx.rootDir], {
        env: {
          NITRO_PRESET: 'node',
          NITRO_BUILD_DIR: buildDir,
          NITRO_OUTPUT_DIR: ctx.outDir,
          NODE_ENV: 'production'
        }
      })

      // Update context from built artifact
      if (options.server) {
        if (options.server === 'http') {
          const { handle } = await importModule(resolve(ctx.outDir, 'server/index.mjs'))

          // Starts server and update context with $fetch pointing on `server.url`
          await startServer(ctx, handle)
          ctx.fetch = <T = unknown>(url: string, opts?: any) => $fetch<T>(url, { baseURL: ctx.server?.url, ...opts })
        } else {
          const { $fetch } = await importModule(resolve(ctx.outDir, 'server/index.mjs'))

          // Use $fetch from Nuxt server
          ctx.fetch = $fetch
        }
      }
    },
    _destroy: async () => ctx.server && (await ctx.server.close())
  }

  return ctx
}

export async function startServer (ctx: TestContext, handle: RequestListener) {
  ctx.server = await listen(handle)
}
