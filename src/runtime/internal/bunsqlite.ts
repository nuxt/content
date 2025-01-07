import * as zlib from 'node:zlib'
import { isAbsolute } from 'pathe'
import type { Database as BunDatabaseType } from 'bun:sqlite'

/**
 * CompressionStream and DecompressionStream polyfill for Bun
 */
if (!globalThis.CompressionStream) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const make = (ctx: unknown, handle: any) => Object.assign(ctx, {
    writable: new WritableStream({
      write: (chunk: ArrayBufferView) => handle.write(chunk),
      close: () => handle.end(),
    }),
    readable: new ReadableStream({
      type: 'bytes',
      start(ctrl) {
        handle.on('data', (chunk: ArrayBufferView) => ctrl.enqueue(chunk))
        handle.once('end', () => ctrl.close())
      },
    }),
  })

  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  globalThis.CompressionStream = class CompressionStream {
    constructor(format: string) {
      make(this, format === 'deflate'
        ? zlib.createDeflate()
        : format === 'gzip' ? zlib.createGzip() : zlib.createDeflateRaw())
    }
  } as unknown as typeof CompressionStream

  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  globalThis.DecompressionStream = class DecompressionStream {
    constructor(format: string) {
      make(this, format === 'deflate'
        ? zlib.createInflate()
        : format === 'gzip'
          ? zlib.createGunzip()
          : zlib.createInflateRaw())
    }
  } as unknown as typeof DecompressionStream
}

function getBunDatabaseSync() {
  // A top level import will make Nuxt complain about a missing module
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('bun:sqlite').Database
}

let db: BunDatabaseType
export const getBunSqliteDatabaseAdapter = (opts: { filename: string }) => {
  const Database = getBunDatabaseSync()
  if (!db) {
    const filename = !opts || isAbsolute(opts?.filename || '') || opts?.filename === ':memory:'
      ? opts?.filename
      : new URL(opts.filename, (globalThis as unknown as { _importMeta_: { url: string } })._importMeta_.url).pathname
    db = new Database(filename, { create: true })
  }

  return {
    async all<T>(sql: string, params?: Array<number | string | boolean>): Promise<T[]> {
      return params ? db.prepare(sql).all(...params) as T[] : db.prepare(sql).all() as T[]
    },
    async first<T>(sql: string, params?: Array<number | string | boolean>): Promise<T | null> {
      return params ? db.prepare(sql).get(...params) as T : db.prepare(sql).get() as T
    },
    async exec(sql: string): Promise<unknown> {
      return db.prepare(sql).run()
    },
  }
}
