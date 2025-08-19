import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import { checksums } from '#content/manifest'

export async function fetchDatabase(event: H3Event | undefined, collection: string): Promise<string> {
  const query = { v: checksums[String(collection)], t: import.meta.dev ? Date.now() : undefined }
  const encEnabled = !!(useRuntimeConfig().public as unknown as { content?: { encryptionEnabled?: boolean } })?.content?.encryptionEnabled

  const base = encEnabled
    ? `/__nuxt_content/${collection}/sql_dump.enc`
    : `/__nuxt_content/${collection}/sql_dump.txt`

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

// Prefer API route for queries; fallback to legacy
export async function fetchQuery<Item>(event: H3Event | undefined, collection: string, sql: string): Promise<Item[]> {
  const common = {
    context: event ? { cloudflare: event.context.cloudflare } : {},
    headers: {
      'content-type': 'application/json',
      ...(event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}),
    },
    query: { v: checksums[String(collection)], t: import.meta.dev ? Date.now() : undefined },
    method: 'POST' as const,
    body: { sql },
  }

  try {
    return await $fetch(`/api/__nuxt_content/${collection}/query`, common)
  }
  catch {
    return await $fetch(`/__nuxt_content/${collection}/query`, common)
  }
}

/**
 * Get a short-lived decryption key after authentication.
 * Cloudflare preset exposes this under /api/__nuxt_content/:collection/key
 */
export async function fetchDumpKey(
  event: H3Event | undefined,
  collection: string,
): Promise<{ kid: string, k: string }> {
  return await $fetch(`/api/__nuxt_content/${collection}/key`, {
    context: event ? { cloudflare: event.context.cloudflare } : {},
    headers: {
      'content-type': 'application/json',
      ...(event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}),
    },
    query: { v: checksums[String(collection)], t: import.meta.dev ? Date.now() : undefined },
  })
}
