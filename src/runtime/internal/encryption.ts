// src/runtime/internal/encryption.ts

import { subtle, getRandomValues } from 'uncrypto'

// Use uncrypto to provide a consistent Web Crypto across Node, Cloudflare Workers, and browsers.
// Falls back to the platform crypto if available.
const te = new TextEncoder()

const base64WhitespaceRE = /[\t\n\f\r ]+/g // TAB, LF, FF, CR, SPACE

export function normalizeBase64(input: string): string {
  return input.replace(base64WhitespaceRE, '')
}

export function b64ToBytes(b64: string): Uint8Array {
  const normalized = normalizeBase64(b64)
  // Browser
  if (typeof atob === 'function') {
    return Uint8Array.from(atob(normalized), c => c.charCodeAt(0))
  }
  // Node: build a fresh Uint8Array backed by a plain ArrayBuffer
  const buf = Buffer.from(normalized, 'base64')
  const out = new Uint8Array(buf.length)
  out.set(buf)
  return out
}

export function bytesToB64(arr: Uint8Array): string {
  // Prefer Node Buffer when available to handle large arrays without stack overflow
  const hasBuffer = typeof Buffer !== 'undefined' && typeof Buffer.from === 'function'
  if (hasBuffer) {
    // Node (or environments exposing Buffer)
    return Buffer.from(arr).toString('base64')
  }

  // Browser fallback: build a binary string in chunks to avoid "Maximum call stack size exceeded"
  if (typeof btoa === 'function') {
    let binary = ''
    const chunkSize = 0x8000 // 32k chars per chunk
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.subarray(i, i + chunkSize)
      binary += String.fromCharCode(...chunk)
    }
    return btoa(binary)
  }

  throw new Error('[content] No base64 encoder available in this runtime')
}

/** Ensure a clean ArrayBuffer view of a Uint8Array (no SharedArrayBuffer typing). */
export function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const { buffer, byteOffset, byteLength } = u8

  if (buffer instanceof ArrayBuffer) {
    if (byteOffset === 0 && byteLength === buffer.byteLength) {
      return buffer
    }

    return buffer.slice(byteOffset, byteOffset + byteLength)
  }

  const out = new ArrayBuffer(byteLength)
  new Uint8Array(out).set(u8)
  return out
}

/** HKDF(master, salt=checksum, info=`content:${collection}`) → raw 32 bytes (AES-256) */
export async function deriveContentKeyRaw(
  masterKeyB64: string,
  checksum: string,
  collection: string,
): Promise<Uint8Array> {
  const master = b64ToBytes(masterKeyB64)
  const hkdfKey = await subtle.importKey(
    'raw',
    toArrayBuffer(master),
    { name: 'HKDF' },
    false,
    ['deriveKey'],
  )
  const derived = await subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: te.encode(checksum || ''), info: te.encode(`content:${collection}`) },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
  const raw = new Uint8Array(await subtle.exportKey('raw', derived))
  return raw
}

export async function deriveContentKeyB64(
  masterKeyB64: string,
  checksum: string,
  collection: string,
): Promise<string> {
  const raw = await deriveContentKeyRaw(masterKeyB64, checksum, collection)
  return bytesToB64(raw)
}

/** Encrypt base64(gzip(JSON)) → base64(JSON envelope) */
export async function encryptGzBase64Envelope(
  gzBase64: string,
  masterKeyB64: string,
  checksum: string,
  collection: string,
): Promise<string> {
  const keyRaw = await deriveContentKeyRaw(masterKeyB64, checksum, collection)
  const key = await subtle.importKey(
    'raw',
    toArrayBuffer(keyRaw),
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  )

  // IV generation via Web Crypto; required in all supported runtimes
  const iv = getRandomValues(new Uint8Array(12))

  const gzBytes = b64ToBytes(gzBase64)
  const ct = new Uint8Array(
    await subtle.encrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, toArrayBuffer(gzBytes)),
  )

  const envelope = {
    v: 1,
    alg: 'A256GCM',
    kid: `v1:${collection}:${checksum}`,
    iv: bytesToB64(iv),
    ciphertext: bytesToB64(ct),
  }
  const json = JSON.stringify(envelope)
  // return base64(JSON)
  if (typeof btoa === 'function') return btoa(json)
  return Buffer.from(json, 'utf8').toString('base64')
}

// Types
export interface DumpEnvelope {
  v: 1
  alg: 'A256GCM'
  kid: string
  iv: string // base64(12)
  ciphertext: string // base64
}

// Parse base64(JSON) or raw JSON string → envelope (or null)
export function parseEnvelopeMaybeBase64(input: string): DumpEnvelope | null {
  try {
    // base64(JSON)
    const bytes = b64ToBytes(input)
    const json = new TextDecoder().decode(bytes)
    const e = JSON.parse(json)
    return (e?.v === 1 && e?.alg === 'A256GCM') ? e as DumpEnvelope : null
  }
  catch {
    try {
      const e = JSON.parse(input)
      return (e?.v === 1 && e?.alg === 'A256GCM') ? e as DumpEnvelope : null
    }
    catch {
      return null
    }
  }
}

export function isEncryptedEnvelope(input: string): boolean {
  return !!parseEnvelopeMaybeBase64(input)
}

/**
 * Decrypt an envelope (given raw 32-byte key as base64) → gzipped bytes (Uint8Array)
 * Useful for both server and client paths.
 */
export async function decryptEnvelopeToGzipBytes(
  envelopeInput: string,
  keyRawB64: string,
): Promise<Uint8Array> {
  const env = parseEnvelopeMaybeBase64(envelopeInput)
  if (!env) throw new Error('Invalid encrypted dump envelope')
  const keyBytes = b64ToBytes(keyRawB64)
  const key = await subtle.importKey(
    'raw',
    toArrayBuffer(keyBytes),
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  )
  const iv = b64ToBytes(env.iv)
  const ciphertext = b64ToBytes(env.ciphertext)
  const gz = new Uint8Array(
    await subtle.decrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, toArrayBuffer(ciphertext)),
  )
  return gz
}
