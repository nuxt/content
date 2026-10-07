import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'
import { fetchDatabase, fetchQuery } from '../../src/runtime/internal/api'

vi.mock('h3', async importOriginal => ({
  ...(await importOriginal<typeof import('h3')>()),
  getRequestHeaders: () => ({
    'content-length': '700000',
    'transfer-encoding': 'chunked',
    'content-encoding': 'gzip',
    'expect': '100-continue',
    'cookie': 'a=b',
    'authorization': 'Bearer token',
  }),
}))

const $fetch = vi.fn().mockResolvedValue([])
const event = { $fetch } as unknown as H3Event

describe('fetchContent', () => {
  beforeEach(() => {
    $fetch.mockClear()
  })

  const expectForwardedHeaders = (headers: Record<string, string | undefined>) => {
    expect(headers['content-length']).toBeUndefined()
    expect(headers['transfer-encoding']).toBeUndefined()
    expect(headers['content-encoding']).toBeUndefined()
    expect(headers.expect).toBeUndefined()
    expect(headers.cookie).toBe('a=b')
    expect(headers.authorization).toBe('Bearer token')
  }

  it('does not forward body headers of the incoming request to the query endpoint', async () => {
    await fetchQuery(event, 'test', 'SELECT 1')

    expect($fetch).toHaveBeenCalledTimes(1)
    const [url, options] = $fetch.mock.calls[0]!
    expect(url).toBe('/__nuxt_content/test/query')
    expect(options.method).toBe('POST')
    expect(options.body).toEqual({ sql: 'SELECT 1' })
    expectForwardedHeaders(options.headers)
    expect(options.headers['content-type']).toBe('application/json')
  })

  it('does not forward body headers of the incoming request to the dump endpoint', async () => {
    await fetchDatabase(event, 'test')

    expect($fetch).toHaveBeenCalledTimes(1)
    const [url, options] = $fetch.mock.calls[0]!
    expect(url).toBe('/__nuxt_content/test/sql_dump.txt')
    expectForwardedHeaders(options.headers)
    expect(options.headers['content-type']).toBe('text/plain')
  })
})
