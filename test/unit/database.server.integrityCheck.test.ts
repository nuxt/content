import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { H3Event } from 'h3'
import type { RuntimeConfig } from '@nuxt/content'

/**
 * Regression test for https://github.com/nuxt/content/issues/3159
 *
 * On Cloudflare Workers, I/O started by a request belongs to that request. When the client
 * disconnects, the runtime cancels the request and its pending D1 calls never settle.
 *
 * `checkAndImportDatabaseIntegrity` shares one in-flight check per collection in a module-level
 * Map. If the request that started the check is cancelled, that promise never settles, its
 * `.catch` never clears the Map entry, and every later request for the collection in the same
 * isolate awaits it forever.
 *
 * The first D1 read below never settles, which is exactly what a cancelled request's I/O looks
 * like from inside the isolate.
 */
describe('database.server - integrity check after a cancelled request (issue #3159)', () => {
  const config = {
    database: { type: 'd1', bindingName: 'DB' },
    localDatabase: { type: 'sqlite', filename: ':memory:' },
    databaseVersion: 'v3.5.0',
    integrityCheck: true,
  } as RuntimeConfig['content']

  let reads: number
  let strandedReads: number

  beforeEach(() => {
    reads = 0
    strandedReads = 1
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.doMock('#content/manifest', () => ({
      tables: { info: '_content_info', articles: '_content_articles' },
      checksums: { articles: 'v3.5.0--abc' },
      checksumsStructure: { articles: 'structure-1' },
      default: {},
    }))
    // The info row matches the build checksum, so a check that gets an answer is one SELECT.
    vi.doMock('#content/adapter', () => ({
      default: () => ({
        prepare: () => ({
          get: () => ++reads <= strandedReads
            ? new Promise(() => {}) // a cancelled request's read: never settles
            : Promise.resolve({ version: 'v3.5.0--abc', structureVersion: 'structure-1', ready: 1 }),
          all: () => Promise.resolve([]),
          run: () => Promise.resolve(undefined),
        }),
      }),
    }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetModules()
    vi.restoreAllMocks()
  })

  test('a later request still settles after the request that started the check was cancelled', async () => {
    const { checkAndImportDatabaseIntegrity } = await import('../../src/runtime/internal/database.server')

    void checkAndImportDatabaseIntegrity(requestEvent(), 'articles', config)
    const laterRequest = settled(checkAndImportDatabaseIntegrity(requestEvent(), 'articles', config))

    // Longer than any request could reasonably wait (Cloudflare's own edge timeout is 100s).
    await vi.advanceTimersByTimeAsync(120_000)

    expect(laterRequest.done).toBe(true)
  })

  test('a later request gives up instead of hanging when every check is stranded', async () => {
    strandedReads = Infinity
    const { checkAndImportDatabaseIntegrity } = await import('../../src/runtime/internal/database.server')

    void checkAndImportDatabaseIntegrity(requestEvent(), 'articles', config)
    const laterRequest = settled(checkAndImportDatabaseIntegrity(requestEvent(), 'articles', config))

    await vi.advanceTimersByTimeAsync(120_000)

    expect(laterRequest.done).toBe(true)
    expect(reads).toBeLessThanOrEqual(3)
  })

  test('the shared check is handed to event.waitUntil so it can outlive its request', async () => {
    const { checkAndImportDatabaseIntegrity } = await import('../../src/runtime/internal/database.server')
    const event = requestEvent()

    void checkAndImportDatabaseIntegrity(event, 'articles', config)

    expect(event.waitUntil).toHaveBeenCalledOnce()
  })
})

function requestEvent() {
  const waitUntil = vi.fn()
  return { waitUntil, context: { waitUntil } } as unknown as H3Event & { waitUntil: typeof waitUntil }
}

function settled(promise: Promise<unknown>) {
  const state = { done: false }
  promise.finally(() => {
    state.done = true
  })
  return state
}
