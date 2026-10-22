import { defineEventHandler, getRouterParam, useRuntimeConfig } from 'nuxt/server'
import { withoutBase } from 'ufo'

export default defineEventHandler(async (event) => {
  const collection = getRouterParam(event, 'collection') || withoutBase(event.url.pathname, useRuntimeConfig().app.baseURL).split('/')[2] || ''
  event.res.headers.set('Content-Type', 'text/plain')

  // Nitro 3 has no `build` storage mount to read a fresher dump from
  return await import('#content/dump').then(m => m[collection])
})
