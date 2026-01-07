import { getRequestHeaders, type H3Event } from 'h3'
import { checksums } from '#content/manifest'

export async function fetchDatabase(event: H3Event | undefined, collection: string): Promise<string> {
  const headers = event ? getRequestHeaders(event) : {}
  const fetch = event?.$fetch || $fetch
  return await fetch(`/__nuxt_content/${collection}/sql_dump.txt`, {
    responseType: 'text',
    headers: {
      ...headers,
      'content-type': 'text/plain',
    },
    query: { v: checksums[String(collection)], t: import.meta.dev ? Date.now() : undefined },
  })
}

export async function fetchQuery<Item>(event: H3Event | undefined, collection: string, sql: string): Promise<Item[]> {
  const headers = event ? getRequestHeaders(event) : {}
  const fetch = event?.$fetch || $fetch
  return await fetch(`/__nuxt_content/${collection}/query`, {
    headers: {
      ...headers,
      'content-type': 'application/json',
    },
    query: { v: checksums[String(collection)], t: import.meta.dev ? Date.now() : undefined },
    method: 'POST',
    body: {
      sql,
    },
  })
}
