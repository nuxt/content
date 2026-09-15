import { eventHandler, getRouterParam, getHeader, createError, getRequestWebStream, readBody } from 'h3'
import type { H3Event } from 'h3'
import loadDatabaseAdapter, { checkAndImportDatabaseIntegrity } from '../internal/database.server'
import { assertSafeQuery, MAX_SQL_QUERY_LENGTH } from '../internal/security'
import type { RuntimeConfig } from '@nuxt/content'
import { useRuntimeConfig } from '#imports'

/**
 * Body envelope is `{"sql":"…"}`. Cap on UTF-16 code units in `sql` is
 * MAX_SQL_QUERY_LENGTH; JSON can expand each unit up to ~6 bytes (`\uXXXX`)
 * plus a small fixed wrapper. Use the worst case so legitimate max-length SQL
 * is never rejected by the body limit before assertSafeQuery sees it.
 */
const JSON_WRAPPER_OVERHEAD = 16 // `{"sql":""}` plus a little slack
const MAX_BODY_BYTES = MAX_SQL_QUERY_LENGTH * 6 + JSON_WRAPPER_OVERHEAD

export default eventHandler(async (event) => {
  // Stream-aware size bound — Content-Length alone can be absent or forged.
  const body = await readBoundedJsonBody<{ sql?: string }>(event, MAX_BODY_BYTES)
  const sql = body?.sql
  const collection = getRouterParam(event, 'collection')! || event.path?.split('/')?.[2] || ''

  assertSafeQuery(sql as string, collection)

  const conf = useRuntimeConfig().content as RuntimeConfig['content']
  if (conf.integrityCheck) {
    await checkAndImportDatabaseIntegrity(event, collection, conf)
  }

  return (await loadDatabaseAdapter(conf)).all(sql as string)
})

/**
 * Read and JSON-parse the request body while refusing more than `limit` bytes.
 * Prefers Content-Length for a fast reject, then enforces while streaming so a
 * forged/missing length cannot force unbounded buffering.
 *
 * Falls back to h3 `readBody` only when no raw stream is available (e.g. some
 * test harnesses that inject a pre-parsed body).
 */
async function readBoundedJsonBody<T>(event: H3Event, limit: number): Promise<T | undefined> {
  const contentLengthHeader = getHeader(event, 'content-length')
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader)
    if (Number.isFinite(contentLength) && contentLength > limit) {
      throw createError({
        statusCode: 413,
        statusMessage: 'Request body too large',
      })
    }
  }

  const stream = getRequestWebStream(event)
  if (stream) {
    const reader = stream.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      if (!value) {
        continue
      }
      total += value.byteLength
      if (total > limit) {
        try {
          await reader.cancel()
        }
        catch {
          // ignore cancel errors
        }
        throw createError({
          statusCode: 413,
          statusMessage: 'Request body too large',
        })
      }
      chunks.push(value)
    }

    if (chunks.length === 0) {
      return undefined
    }

    const buffer = Buffer.concat(chunks.map(c => Buffer.from(c)))
    if (buffer.byteLength === 0) {
      return undefined
    }

    try {
      return JSON.parse(buffer.toString('utf8')) as T
    }
    catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid JSON body',
      })
    }
  }

  // No stream (pre-parsed / test body) — h3 already has it in memory.
  return await readBody<T>(event)
}
