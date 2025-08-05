import * as zlib from 'node:zlib'
import bunSqliteConnector from 'db0/connectors/bun-sqlite'

const connector: typeof bunSqliteConnector = (opts) => {
  /**
   * CompressionStream and DecompressionStream polyfill for Bun
   */
  if (!globalThis.CompressionStream) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const make = (ctx: unknown, handle: any) =>
      Object.assign(ctx as object, {
        writable: new WritableStream({
          write: (chunk: ArrayBufferView) => handle.write(chunk),
          close: () => handle.end(),
        }),
        readable: new ReadableStream({
          type: 'bytes',
          start(ctrl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            handle.on('data', (chunk: any) => ctrl.enqueue(chunk))
            handle.once('end', () => ctrl.close())
          },
        }),
      })

    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    globalThis.CompressionStream = class CompressionStream {
      constructor(format: string) {
        make(
          this,
          format === 'deflate'
            ? zlib.createDeflate()
            : format === 'gzip'
              ? zlib.createGzip()
              : zlib.createDeflateRaw(),
        )
      }
    } as unknown as typeof CompressionStream

    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    globalThis.DecompressionStream = class DecompressionStream {
      constructor(format: string) {
        make(
          this,
          format === 'deflate'
            ? zlib.createInflate()
            : format === 'gzip'
              ? zlib.createGunzip()
              : zlib.createInflateRaw(),
        )
      }
    } as unknown as typeof DecompressionStream
  }

  return bunSqliteConnector(opts)
}

export default connector
