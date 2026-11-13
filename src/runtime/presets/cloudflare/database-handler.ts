import { createError, defineEventHandler, getRouterParam, serverFetch, useRuntimeConfig } from 'nuxt/server'
import { joinURL, withoutBase } from 'ufo'

interface AssetsBinding {
  fetch: (input: URL) => Promise<Response>
}

interface CloudflareRequest {
  runtime?: { cloudflare?: { env?: { ASSETS?: AssetsBinding } } }
}

export default defineEventHandler(async (event) => {
  const { baseURL } = useRuntimeConfig().app
  const collection = getRouterParam(event, 'collection') || withoutBase(event.url.pathname, baseURL).split('/')[2] || ''
  event.res.headers.set('Content-Type', 'text/plain')

  const dumpPath = `/dump.${collection}.sql`

  // Nitro 3 exposes the Cloudflare bindings on the request
  const ASSETS = (event.req as CloudflareRequest).runtime?.cloudflare?.env?.ASSETS || process.env.ASSETS as unknown as AssetsBinding | undefined
  if (ASSETS) {
    const url = new URL(event.req.url)
    url.pathname = joinURL(baseURL, dumpPath)
    const response = await ASSETS.fetch(url)
    if (!response.ok) {
      throw createError({ status: response.status, statusText: response.statusText })
    }
    return await response.text()
  }

  // Nitro 3 has no `build` storage mount, the dump is served from the public assets while prerendering
  const response = await serverFetch(event, dumpPath, { forwardHeaders: false })
  if (!response.ok) {
    throw createError({ status: response.status, statusText: response.statusText })
  }
  return await response.text()
})
