import { subtle } from 'uncrypto'
import { b64ToBytes, normalizeBase64, toArrayBuffer } from './encryption'

export async function decompressSQLDump(base64Str: string, compressionType: CompressionFormat = 'gzip'): Promise<string[]> {
  // Browser/Workers fast path
  if (
    typeof atob === 'function'
    && typeof (globalThis as unknown as { DecompressionStream?: unknown }).DecompressionStream !== 'undefined'
  ) {
    const binaryData = b64ToBytes(base64Str)
    const response = new Response(new Blob([toArrayBuffer(binaryData)]))
    const decompressedStream = response.body?.pipeThrough(new DecompressionStream(compressionType))
    const text = await new Response(decompressedStream).text()
    return JSON.parse(text)
  }

  // Node fallback (no atob / DecompressionStream)
  if (typeof Buffer !== 'undefined') {
    const { gunzipSync, inflateSync } = await import('node:zlib')
    const buf = Buffer.from(normalizeBase64(base64Str), 'base64')
    const out = compressionType === 'gzip' ? gunzipSync(buf) : inflateSync(buf)
    return JSON.parse(out.toString('utf8'))
  }

  throw new TypeError('No base64 decoding method available')
}

interface DumpEnvelope { v: number, alg: string, iv: string, ciphertext: string }
function isDumpEnvelope(o: unknown): o is DumpEnvelope {
  return !!o && typeof o === 'object'
    && typeof (o as Record<string, unknown>).v === 'number'
    && typeof (o as Record<string, unknown>).alg === 'string'
    && typeof (o as Record<string, unknown>).iv === 'string'
    && typeof (o as Record<string, unknown>).ciphertext === 'string'
}

/**
 * Decrypts an encrypted dump envelope (AES-256-GCM), then gunzips → JSON array.
 * Accepts either base64(JSON) or raw JSON envelope (stringified).
 */
export async function decryptAndDecompressSQLDump(
  envelopeInput: string,
  keyRawB64: string, // base64(32 bytes)
): Promise<string[]> {
  // Try base64(JSON) first; fall back to raw JSON string
  let envelope: unknown
  try {
    const jsonBytes = b64ToBytes(envelopeInput)
    envelope = JSON.parse(new TextDecoder().decode(jsonBytes))
  }
  catch {
    envelope = JSON.parse(envelopeInput)
  }

  if (!isDumpEnvelope(envelope) || envelope.v !== 1 || envelope.alg !== 'A256GCM') {
    throw new Error('Unsupported dump envelope')
  }

  const iv = b64ToBytes(envelope.iv)
  const ciphertext = b64ToBytes(envelope.ciphertext)
  const keyBytes = b64ToBytes(keyRawB64)
  const cryptoKey = await subtle.importKey('raw', toArrayBuffer(keyBytes), { name: 'AES-GCM' }, false, ['decrypt'])

  const gzBytes = new Uint8Array(
    await subtle.decrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, cryptoKey, toArrayBuffer(ciphertext)),
  )
  const response = new Response(new Blob([toArrayBuffer(gzBytes)]))
  const decompressedStream = response.body?.pipeThrough(new DecompressionStream('gzip'))
  const text = await new Response(decompressedStream).text()
  return JSON.parse(text)
}
