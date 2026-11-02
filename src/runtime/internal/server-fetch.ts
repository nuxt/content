import { createError, serverFetch } from 'nuxt/server'
import type { RequestEvent } from 'nuxt/server'
import { withQuery } from 'ufo'
import { destr } from 'destr'
import type { ContentFetch, ContentFetchOptions } from './api'
import type { ContentEvent } from './event'

export const serverFetchContent: ContentFetch = async <T>(event: ContentEvent | undefined, url: string, options: ContentFetchOptions) => {
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
    // Keep the error the route responded with, as ofetch does with `event.$fetch` on Nitro 2
    const body = await response.text()
    const data = destr<{ message?: string } | string | undefined>(body)
    throw createError({
      status: response.status,
      statusText: response.statusText,
      message: (typeof data === 'object' && data?.message) || `[${options.method || 'GET'}] "${url}": ${response.status} ${response.statusText}`,
      data,
    })
  }

  return (options.responseType === 'text' ? response.text() : response.json()) as Promise<T>
}
