import type { H3Event } from 'h3'
import { checksums } from '#content/manifest'

export async function fetchDatabase(event: H3Event | undefined, collection: string): Promise<string> {
  return await $fetch(`/__nuxt_content/${collection}/sql_dump`, {
    context: event ? { cloudflare: event.context.cloudflare } : {},
    responseType: 'text',
    headers: { 'content-type': 'text/plain' },
    query: { v: checksums[String(collection)], t: import.meta.dev ? Date.now() : undefined },
  })
}

export async function fetchQuery<Item>(event: H3Event | undefined, collection: string, sql: string): Promise<Item[]> {
  return await $fetch(`/__nuxt_content/${collection}/query`, {
    context: event ? { cloudflare: event.context.cloudflare } : {},
    headers: { 'content-type': 'application/json' },
    query: { v: checksums[String(collection)], t: import.meta.dev ? Date.now() : undefined },
    method: 'POST',
    body: {
      sql,
    },
  })
}
