// src/runtime/internal/api.ts
import { useRuntimeConfig } from '#imports'
import { checksums } from '#content/manifest'
import { purgeContentCaches } from '../client/purge'

import type { H3Event } from 'h3'

// Local types to avoid `any`
type PublicRuntime = { content?: { encryptionEnabled?: boolean } }
type ErrorLike = { status?: number, statusCode?: number, response?: { status?: number }, message?: string }

function encOn() {
  const pub = useRuntimeConfig().public as Partial<PublicRuntime>
  return !!pub?.content?.encryptionEnabled
}
function isRecoverable(e: unknown) {
  const err = e as ErrorLike
  const s = Number(err?.status ?? err?.statusCode ?? err?.response?.status ?? 0)
  const m = String(err?.message ?? '')
  return [401, 403, 404].includes(s)
    || /decrypt|aes|gcm|checksum|ciphertext|operationerror/i.test(m)
}
async function selfHealOnce(collection: string) {
  try {
    localStorage.removeItem(`content_${'checksum_' + collection}`)
    localStorage.removeItem(`content_${'collection_' + collection}`)
  }
  catch (_err) {
    // Non-critical: best-effort cleanup

    console.debug?.('[content] selfHealOnce: localStorage cleanup failed ' + _err)
  }
  // Clear IndexedDB and any other client caches (best-effort)
  try {
    await purgeContentCaches?.()
  }
  catch (_err) {
    console.debug?.('[content] selfHealOnce: purgeContentCaches failed ' + _err)
  }
  if (encOn()) {
    try {
      await fetchDumpKey(undefined, collection)
    }
    catch (_err) {
      // Non-critical: key fetch may fail; we retry later

      console.debug?.('[content] selfHealOnce: fetchDumpKey failed:' + _err)
    }
  }
}

// override fetchDatabase
export async function fetchDatabase(event: H3Event | undefined, collection: string): Promise<string> {
  const base = encOn()
    ? `/__nuxt_content/${collection}/sql_dump.enc`
    : `/__nuxt_content/${collection}/sql_dump.txt`
  const query = { v: checksums[String(collection)], t: import.meta.dev ? Date.now() : undefined }
  try {
    return await $fetch(base, {
      context: event ? { cloudflare: event.context.cloudflare } : {},
      responseType: 'text',
      headers: {
        'content-type': 'text/plain',
        ...(event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}),
      },
      query,
    })
  }
  catch (e) {
    if (!isRecoverable(e)) throw e
    await selfHealOnce(collection)
    return await $fetch(base, {
      context: event ? { cloudflare: event.context.cloudflare } : {},
      responseType: 'text',
      headers: {
        'content-type': 'text/plain',
        ...(event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}),
      },
      query: { v: checksums[String(collection)], t: Date.now() },
    })
  }
}

// override fetchQuery
export async function fetchQuery<Item>(
  event: H3Event | undefined,
  collection: string,
  sql: string,
): Promise<Item[]> {
  const opts = {
    context: event ? { cloudflare: event.context.cloudflare } : {},
    method: 'POST' as const,
    headers: {
      'content-type': 'application/json',
      ...(event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}),
    },
    body: { sql },
  }
  const query = { v: checksums[String(collection)], t: import.meta.dev ? Date.now() : undefined }

  try {
    return await $fetch(`/__nuxt_content/${collection}/query`, { ...opts, query })
  }
  catch (e) {
    if (!isRecoverable(e)) throw e
    await selfHealOnce(collection)
    return await $fetch(`/__nuxt_content/${collection}/query`, {
      ...opts,
      query: { v: checksums[String(collection)], t: Date.now() },
    })
  }
}

// keep fetchDumpKey as-is
export async function fetchDumpKey(
  event: H3Event | undefined,
  collection: string,
): Promise<{ kid: string, k: string }> {
  return await $fetch(`/__nuxt_content/${collection}/key`, {
    context: event ? { cloudflare: event.context.cloudflare } : {},
    headers: {
      'content-type': 'application/json',
      ...(event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}),
    },
    query: { v: checksums[String(collection)], t: import.meta.dev ? Date.now() : undefined },
  })
}
