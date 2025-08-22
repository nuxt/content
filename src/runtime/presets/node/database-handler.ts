import { eventHandler, getRouterParam, setHeader, createError } from 'h3'
import { useRuntimeConfig, useStorage } from 'nitropack/runtime'
import { deriveContentKeyB64, encryptGzBase64Envelope } from '../../internal/encryption'

export default eventHandler(async (event) => {
  const collection = getRouterParam(event, 'collection')!
  // `event.node.req.url` can be a relative path, which causes `new URL` to throw.
  // Provide a base to ensure a valid absolute URL is always created.
  const url = new URL(event.node.req.url || '', 'http://localhost')

  const runtime = useRuntimeConfig()
  const encEnabled = !!runtime?.content?.encryption?.enabled
  const masterB64 = runtime?.content?.encryption?.masterKey

  // --- /__nuxt_content/:collection/key ---
  if (url.pathname.endsWith('/key')) {
    if (!encEnabled) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    }
    // TODO: AuthN/Z — implement in your app before returning a key
    const kidParam = url.searchParams.get('kid') || ''
    const vParam = url.searchParams.get('v') || ''
    if (!masterB64) {
      throw createError({ statusCode: 500, statusMessage: 'Missing content.encryption.masterKey' })
    }

    let derivedCollection = collection
    let derivedChecksum = vParam

    // Prefer kid if provided: expected format "v1:<collection>:<checksum>"
    if (kidParam) {
      const parts = kidParam.split(':')
      if (parts.length >= 3) {
        derivedCollection = parts[1] || derivedCollection
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

    // Prefer prebuilt encrypted dump
    const prebuilt = await useStorage().getItem<string>(`build:content:raw:dump.${collection}.sql.enc`)
    if (prebuilt) {
      setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
      return prebuilt
    }

    // Fallback: encrypt the prebuilt plaintext on the fly
    const gzBase64 = await useStorage().getItem<string>(`build:content:raw:dump.${collection}.sql`)
    if (!gzBase64 || !masterB64) {
      return ''
    }
    const checksum = url.searchParams.get('v') || ''
    const envelopeB64 = await encryptGzBase64Envelope(gzBase64, masterB64, checksum, collection)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    return envelopeB64
  }

  // --- /__nuxt_content/:collection/sql_dump.txt --- (plaintext)
  setHeader(event, 'Content-Type', 'text/plain')

  if (encEnabled) {
    // Hide plaintext in encrypted mode
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  // Prefer prebuilt plaintext from Nitro storage
  const plain = await useStorage().getItem<string>(`build:content:raw:dump.${collection}.sql`)
  if (plain) {
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    return plain
  }

  return ''
})
