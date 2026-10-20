import type { H3Event } from 'h3'
import { checksums } from '#content/manifest'

/**
 * An h3 v1 event on Nitro 2, or a web standard request event on Nuxt 5.
 */
export type ContentRequestEvent = H3Event | { req: Request }

export interface ContentFetchOptions {
  method?: 'POST'
  headers: Record<string, string | undefined>
  query: Record<string, string | number | undefined>
  body?: { sql: string }
  responseType?: 'text'
}

export type ContentFetch = <T>(event: ContentRequestEvent | undefined, url: string, options: ContentFetchOptions) => Promise<T>

/**
 * The headers of a web standard request event. `event.req` is a web `Request` on Nuxt 5
 * and the node `IncomingMessage` on Nitro 2.
 */
function getWebRequestHeaders(event: ContentRequestEvent): Headers | undefined {
  const headers = (event as { req?: { headers?: unknown } }).req?.headers as Headers | undefined
  return typeof headers?.entries === 'function' ? headers : undefined
}

/**
 * Fetch through `event.$fetch` on Nitro 2, through `$fetch` otherwise. On Nuxt 5, `event.$fetch`
 * only exists when the Nitro 2 compatibility layer is installed, and it ignores the app base URL.
 */
export const eventFetch: ContentFetch = <T>(event: ContentRequestEvent | undefined, url: string, options: ContentFetchOptions) => {
  const fetchOptions = options as NonNullable<Parameters<typeof $fetch>[1]>
  const $eventFetch = event && !getWebRequestHeaders(event) ? (event as H3Event).$fetch : undefined
  return ($eventFetch ? $eventFetch(url, fetchOptions) : $fetch(url, fetchOptions)) as Promise<T>
}

function getRequestHeaders(event: ContentRequestEvent): Record<string, string | undefined> {
  const headers = getWebRequestHeaders(event) || (event as H3Event).headers
  return Object.fromEntries(headers.entries())
}

async function fetchContent<T>(
  event: ContentRequestEvent | undefined,
  collection: string,
  path: string,
  options: Omit<ContentFetchOptions, 'query'>,
  fetch: ContentFetch,
): Promise<T> {
  const headers = event ? getRequestHeaders(event) : {}
  headers['accept-encoding'] = undefined // prevent unsupported enconding issue (https://github.com/nuxt/content/pull/3701)
  // The internal request has its own body, so never inherit the incoming request's body framing headers
  for (const name of ['content-length', 'transfer-encoding', 'content-encoding', 'expect']) {
    headers[name] = undefined
  }

  const url = `/__nuxt_content/${collection}/${path}`
  return fetch<T>(event, url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    query: { v: checksums[String(collection)], t: import.meta.dev ? Date.now() : undefined },
  })
}

export async function fetchDatabase(event: ContentRequestEvent | undefined, collection: string, fetch: ContentFetch = eventFetch): Promise<string> {
  return fetchContent(event, collection, 'sql_dump.txt', {
    responseType: 'text',
    headers: {
      'content-type': 'text/plain',
    },
  }, fetch)
}

export async function fetchQuery<Item>(event: ContentRequestEvent | undefined, collection: string, sql: string, fetch: ContentFetch = eventFetch): Promise<Item[]> {
  return fetchContent(event, collection, 'query', {
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    body: {
      sql,
    },
  }, fetch)
}
