import { getRequestHeaders, type H3Event } from 'h3'
import { checksums } from '#content/manifest'

async function fetchContent<T>(
  event: H3Event | undefined,
  collection: string,
  path: string,
  options: NonNullable<Parameters<typeof $fetch>[1]>,
): Promise<T> {
  const headers = event ? getRequestHeaders(event) : {}
  const url = `/__nuxt_content/${collection}/${path}`
  const fetchOptions = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    query: { v: checksums[String(collection)], t: import.meta.dev ? Date.now() : undefined },
  }
  return event ? await event.$fetch(url, fetchOptions) : await $fetch(url, fetchOptions)
}

export async function fetchDatabase(event: H3Event | undefined, collection: string): Promise<string> {
  return fetchContent(event, collection, 'sql_dump.txt', {
    responseType: 'text',
    headers: {
      'content-type': 'text/plain',
    },
  })
}

export async function fetchQuery<Item>(event: H3Event | undefined, collection: string, sql: string): Promise<Item[]> {
  return fetchContent(event, collection, 'query', {
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    body: {
      sql,
    },
  })
}
