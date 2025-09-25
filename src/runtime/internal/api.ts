// src/runtime/internal/api.ts
import { useRuntimeConfig } from '#imports'
import { checksums } from '#content/manifest'

import type { H3Event } from 'h3'

// Local types to avoid `any`
type PublicRuntime = { content?: { encryptionEnabled?: boolean } }
type PrivateRuntime = { content?: { encryption?: { enabled?: boolean } } }
type ErrorLike = { status?: number, statusCode?: number, response?: { status?: number }, message?: string }

function encOn() {
  const runtime = useRuntimeConfig()
  const pub = runtime.public as Partial<PublicRuntime>
  const priv = runtime as Partial<PrivateRuntime>
  return Boolean(pub?.content?.encryptionEnabled ?? priv?.content?.encryption?.enabled)
}

function isRecoverable(e: unknown) {
  const err = e as ErrorLike
  const s = Number(err?.status ?? err?.statusCode ?? err?.response?.status ?? 0)
  const m = String(err?.message ?? '')
  return [401, 403, 404].includes(s)
    || /decrypt|aes|gcm|checksum|ciphertext|operationerror/i.test(m)
}

async function selfHealOnce(event: H3Event | undefined, collection: string) {
  // Minimal self-heal: only clear this collection’s cached dump + checksum
  try {
    localStorage.removeItem(`content_${'checksum_' + collection}`)
    localStorage.removeItem(`content_${'collection_' + collection}`)
  }
  catch {
    // Non-critical: best-effort cleanup
  }

  // If encryption is enabled, proactively (best-effort) re-fetch the key
  if (encOn()) {
    try {
      await fetchDumpKey(event, collection)
    }
    catch {
      // Non-critical: key fetch may fail; we retry later
    }
  }
}

function withCloudflareContext<T extends Record<string, unknown>>(event: H3Event | undefined, options: T): T {
  const cloudflare = event?.context?.cloudflare
  if (!cloudflare) {
    return options
  }

  return { ...options, context: { cloudflare } } as T
}

// override fetchDatabase
export async function fetchDatabase(event: H3Event | undefined, collection: string): Promise<string> {
  const encPreferred = encOn()
  const checksum = checksums[String(collection)]
  const headers = {
    'content-type': 'text/plain',
    ...(event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}),
  }
  const attempts = encPreferred
    ? [
        `/__nuxt_content/${collection}/sql_dump.enc`,
        `/__nuxt_content/${collection}/sql_dump.txt`,
      ]
    : [
        `/__nuxt_content/${collection}/sql_dump.txt`,
        `/__nuxt_content/${collection}/sql_dump.enc`,
      ]

  let lastError: unknown
  for (const path of attempts) {
    const query = { v: checksum, t: import.meta.dev ? Date.now() : undefined }
    const doFetch = async (stamp?: number) => {
      const payload = await $fetch<string>(path, withCloudflareContext(event, {
        responseType: 'text' as const,
        headers,
        query: { v: checksum, t: stamp ?? query.t },
      }))

      if (!payload || !payload.trim()) {
        const error = new Error(`Empty dump payload from ${path}`)
        Object.assign(error, { status: 404 })
        throw error
      }

      return payload
    }

    try {
      return await doFetch()
    }
    catch (err) {
      if (!isRecoverable(err)) {
        throw err
      }
      lastError = err
      await selfHealOnce(event, collection)
      const retryStamp = Date.now()
      try {
        return await doFetch(retryStamp)
      }
      catch (retryErr) {
        if (!isRecoverable(retryErr)) {
          throw retryErr
        }
        lastError = retryErr
      }
    }
  }

  throw lastError ?? new Error('Failed to fetch content dump')
}

// override fetchQuery
export async function fetchQuery<Item>(
  event: H3Event | undefined,
  collection: string,
  sql: string,
): Promise<Item[]> {
  const checksum = checksums[String(collection)]

  const opts = {
    method: 'POST' as const,
    headers: {
      'content-type': 'application/json',
      ...(event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}),
    },
    body: { sql },
  }
  const initialQuery = { v: checksum, t: import.meta.dev ? Date.now() : undefined }

  try {
    const rows = await $fetch<Item[]>(
      `/__nuxt_content/${collection}/query`,
      withCloudflareContext(event, { ...opts, query: initialQuery }),
    )
    return rows
  }
  catch (e) {
    if (!isRecoverable(e)) {
      throw e
    }
    await selfHealOnce(event, collection)
    const retryStamp = Date.now()
    return await $fetch<Item[]>(
      `/__nuxt_content/${collection}/query`,
      withCloudflareContext(event, {
        ...opts,
        query: { v: checksum, t: retryStamp },
      }),
    )
  }
}

// keep fetchDumpKey as-is
export async function fetchDumpKey(
  event: H3Event | undefined,
  collection: string,
  kid?: string,
): Promise<{ kid: string, k: string }> {
  return await $fetch(`/__nuxt_content/${collection}/key`, {
    ...withCloudflareContext(event, {
      headers: {
        'content-type': 'application/json',
        ...(event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}),
      },
      // Prefer kid when available; fall back to legacy v=checksum for backward compatibility
      query: kid
        ? { kid, t: import.meta.dev ? Date.now() : undefined }
        : { v: checksums[String(collection)], t: import.meta.dev ? Date.now() : undefined },
    }),
  })
}
