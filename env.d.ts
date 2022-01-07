declare module 'ohmyfetch/node' {
  import type { $Fetch } from 'ohmyfetch'
  declare const fetch: typeof globalThis.fetch
  declare const Headers: {
    new (init?: HeadersInit | undefined): Headers
    prototype: Headers
  }
  declare const $fetch: $Fetch

  export { $fetch, Headers, fetch }
}
