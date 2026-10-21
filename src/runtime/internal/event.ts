import type { H3Event } from 'h3'

/**
 * The event a `nuxt/server` handler receives (Nuxt 4.6+).
 * Declared here instead of imported, `nuxt/server` does not resolve on older Nuxt versions.
 */
export interface RequestEvent {
  readonly req: Request
  url: URL
  readonly res: {
    status?: number
    statusText?: string
    readonly headers: Headers
  }
  readonly context: Record<string, unknown>
}

export type ContentEvent = H3Event | RequestEvent
