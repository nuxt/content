import { eventHandler, getRouterParam, setHeader, createError } from 'h3'
import type { H3Event } from 'h3'
import { useRuntimeConfig, useStorage } from 'nitropack/runtime'
import { deriveContentKeyB64, encryptGzBase64Envelope } from '../../internal/encryption'

type AssetsBinding = { fetch: typeof fetch }

type AssetFetchResult = { body: string, pathname: string }

const encryptedAssetCandidates = (collection: string) => [
  `/__nuxt_content/${collection}/sql_dump.enc`,
  `/_nuxt/content/raw/dump.${collection}.sql.enc`,
  `/_nuxt/content/${collection}/sql_dump.enc`,
]

const plaintextAssetCandidates = (collection: string) => [
  `/__nuxt_content/${collection}/sql_dump.txt`,
  `/_nuxt/content/raw/dump.${collection}.sql`,
  `/_nuxt/content/${collection}/sql_dump.txt`,
]

async function fetchFromAssets(event: H3Event, pathnames: string[]): Promise<AssetFetchResult | null> {
  const binding = (event?.context?.cloudflare?.env?.ASSETS as AssetsBinding | undefined)
    ?? (typeof process !== 'undefined'
      ? (process.env.ASSETS as unknown as AssetsBinding | undefined)
      : undefined)

  if (!binding?.fetch) {
    return null
  }

  const requestUrl = event?.context?.cloudflare?.request?.url

  for (const candidate of pathnames) {
    const normalizedPath = candidate.startsWith('/') ? candidate : `/${candidate}`
    try {
      const baseUrl = requestUrl
        ? new URL(requestUrl)
        : new URL(normalizedPath, 'http://localhost')
      baseUrl.pathname = normalizedPath
      baseUrl.search = ''
      const response = await binding.fetch(baseUrl.toString())
      const contentType = response.headers.get('content-type') || ''
      if (!response.ok) {
        continue
      }
      const text = await response.text()
      if ((/text\/html/i.test(contentType) || /^\s*<!?(?:doctype|html)/i.test(text))) {
        continue
      }
      return { body: text, pathname: normalizedPath }
    }
    catch {
      // Ignore failed asset fetch attempts and continue with other candidates.
    }
  }

  return null
}

export default eventHandler(async (event) => {
  const collection = getRouterParam(event, 'collection')!
  // `event.node.req.url` may be relative; supply a base URL to avoid runtime errors.
  const url = new URL(event.node.req.url || '', 'http://localhost')
  const runtime = useRuntimeConfig()
  const encEnabled = !!runtime?.content?.encryption?.enabled
  const masterB64 = runtime?.content?.encryption?.masterKey
  const storage = useStorage()
  const getStorageItem = async <T = string>(key: string): Promise<T | null> => {
    try {
      return await storage.getItem<T>(key)
    }
    catch {
      return null
    }
  }

  if (url.pathname.endsWith('/key')) {
    if (!encEnabled) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    }
    // TODO: Add your AuthN/Z here; deny if not allowed.
    const kidParam = url.searchParams.get('kid') || ''
    const vParam = url.searchParams.get('v') || ''
    if (!masterB64) {
      throw createError({ statusCode: 500, statusMessage: 'Missing content.encryption.masterKey' })
    }

    const derivedCollection = collection
    let derivedChecksum = vParam

    // Prefer kid if provided: format expected "v1:<collection>:<checksum>"
    if (kidParam) {
      const parts = kidParam.split(':')
      if (parts.length >= 3) {
        derivedChecksum = parts[2] || derivedChecksum
      }
    }

    const k = await deriveContentKeyB64(masterB64, derivedChecksum, derivedCollection)
    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Cache-Control', 'no-store')
    return { kid: kidParam || `v1:${derivedCollection}:${derivedChecksum}`, k }
  }

  // --- /__nuxt_content/:collection/sql_dump.enc ---
  if (url.pathname.endsWith('/sql_dump.enc')) {
    if (!encEnabled) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    }
    setHeader(event, 'Content-Type', 'application/octet-stream')
    // Prefer prebuilt encrypted dump if present
    const encKey = `build:content:raw:dump.${collection}.sql.enc`
    const plainKey = `build:content:raw:dump.${collection}.sql`
    const prebuilt = await getStorageItem<string>(encKey)
    if (prebuilt !== null && prebuilt !== undefined) {
      setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
      return prebuilt
    }

    const assetPrebuilt = await fetchFromAssets(event, encryptedAssetCandidates(collection))
    if (assetPrebuilt) {
      setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
      return assetPrebuilt.body
    }

    // Fallback: encrypt the prebuilt plaintext on the fly
    const gzBase64 = (await getStorageItem<string>(plainKey))
      ?? await (async () => {
        const asset = await fetchFromAssets(
          event,
          plaintextAssetCandidates(collection),
        )
        return asset ? asset.body : null
      })()
    if (!masterB64) {
      throw createError({ statusCode: 500, statusMessage: 'Missing content.encryption.masterKey' })
    }
    if (!gzBase64) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    }
    const checksum = url.searchParams.get('v') || ''
    const envelopeB64 = await encryptGzBase64Envelope(gzBase64, masterB64, checksum, collection)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    return envelopeB64
  }

  // --- plaintext dump /__nuxt_content/:collection/sql_dump.txt ---
  // Served only when encryption is disabled
  setHeader(event, 'Content-Type', 'text/plain')
  if (encEnabled) {
    // If someone hits .txt while enc is on, hide it
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  // Prefer prebuilt plaintext from Nitro storage
  const plainKey = `build:content:raw:dump.${collection}.sql`
  const plain = await getStorageItem<string>(plainKey)
  if (plain !== null && plain !== undefined) {
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    return plain
  }

  const assetPlain = await fetchFromAssets(event, plaintextAssetCandidates(collection))
  if (assetPlain) {
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    return assetPlain.body
  }
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
})
