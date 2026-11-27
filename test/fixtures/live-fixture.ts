import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll } from 'vitest'
import { useTestContext } from '@nuxt/test-utils/e2e'
import { startVercelFunction } from './vercel-function'

export const liveFixtureDir = fileURLToPath(new URL('./live', import.meta.url))

export type LiveServer = Awaited<ReturnType<typeof startVercelFunction>>

export const tmpDir = () => mkdtempSync(join(tmpdir(), 'nuxt-content-live-'))

/** Start servers of the built `live` fixture, each with its own forge. Servers given the same `LIVE_CACHE_DIR` share a cache driver. */
export function useLiveServers(defaults: Record<string, string> = {}) {
  const servers: LiveServer[] = []
  afterAll(() => {
    for (const server of servers) server.stop()
  })
  return async (env: Record<string, string> = {}) => {
    const server = await startVercelFunction(useTestContext().nuxt!.options.nitro.output!.dir!, { LIVE_CACHE_DIR: tmpDir(), LIVE_FORGE: 'online', ...defaults, ...env })
    servers.push(server)
    return server
  }
}

export async function json<T>(server: LiveServer, path: string, init?: RequestInit) {
  const response = await fetch(server.url + path, { ...init, signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error(`${path}: ${response.status} ${await response.text()}`)
  return await response.json() as T
}

/** Return the first heading of the document at `path`. */
export const title = async (server: LiveServer, path: string) => JSON.stringify(await json(server, `/__nuxt_content/get${path}`)).match(/(?:Home|Docs) at \w+/)?.[0]

/** Move the head of `repo`, then call `revalidateContent()` unless `revalidate` is false. */
export const push = <T = Record<string, unknown>>(server: LiveServer, repo: string, head: string, revalidate = true) =>
  json<T>(server, '/api/push', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ repo, head, revalidate }) })

/** Set how the server's forge answers and return what was asked of it. */
export const forge = (server: LiveServer, query = '') => json<{ asked: string[] }>(server, `/api/forge?${query}`)
