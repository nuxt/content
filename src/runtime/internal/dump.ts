export async function decompressSQLDump(
  base64Str: string,
  compressionType: 'gzip' | 'deflate' = 'gzip',
): Promise<string[]> {
  // Browser/Workers fast path
  if (typeof atob === 'function' && typeof (globalThis as unknown as { DecompressionStream?: unknown }).DecompressionStream !== 'undefined') {
    const binaryData = Uint8Array.from(atob(base64Str), c => c.charCodeAt(0))
    const response = new Response(new Blob([binaryData]))
    const decompressedStream = response.body?.pipeThrough(new DecompressionStream(compressionType))
    const text = await new Response(decompressedStream).text()
    return JSON.parse(text)
  }

  // Node fallback (no atob / DecompressionStream)
  const { gunzipSync, inflateSync } = await import('node:zlib')
  const buf = Buffer.from(base64Str, 'base64')
  const out = compressionType === 'gzip' ? gunzipSync(buf) : inflateSync(buf)
  return JSON.parse(out.toString('utf8'))
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
    const jsonBytes = Uint8Array.from(atob(envelopeInput), c => c.charCodeAt(0))
    envelope = JSON.parse(new TextDecoder().decode(jsonBytes))
  }
  catch {
    envelope = JSON.parse(envelopeInput)
  }

  if (!isDumpEnvelope(envelope) || envelope.v !== 1 || envelope.alg !== 'A256GCM') {
    throw new Error('Unsupported dump envelope')
  }

  const iv = Uint8Array.from(atob(envelope.iv), c => c.charCodeAt(0))
  const ciphertext = Uint8Array.from(atob(envelope.ciphertext), c => c.charCodeAt(0))
  const keyBytes = Uint8Array.from(atob(keyRawB64), c => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt'])

  const gzBytes = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext))
  const response = new Response(new Blob([gzBytes]))
  const decompressedStream = response.body?.pipeThrough(new DecompressionStream('gzip'))
  const text = await new Response(decompressedStream).text()
  return JSON.parse(text)
}
