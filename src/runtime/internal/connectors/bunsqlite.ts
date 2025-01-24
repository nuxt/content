import * as zlib from 'node:zlib'

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

export { default as default } from 'db0/connectors/bun-sqlite'
