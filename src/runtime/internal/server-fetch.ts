import { createError, serverFetch } from 'nuxt/server'
import type { RequestEvent } from 'nuxt/server'
import { withQuery } from 'ufo'
import type { ContentFetch, ContentFetchOptions, ContentRequestEvent } from './api'

export const serverFetchContent: ContentFetch = async <T>(event: ContentRequestEvent | undefined, url: string, options: ContentFetchOptions) => {
  const headers = new Headers()
  for (const [name, value] of Object.entries(options.headers)) {
    if (value !== undefined) {
      headers.set(name, value)
    }
  }

  const response = await serverFetch(event as RequestEvent, withQuery(url, options.query), {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    // The headers of the incoming request are already in `options.headers`
    forwardHeaders: false,
  })

  if (!response.ok) {
    throw createError({ status: response.status, statusText: response.statusText })
  }

  return (options.responseType === 'text' ? response.text() : response.json()) as Promise<T>
}
