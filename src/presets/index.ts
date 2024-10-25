import type { Nuxt } from '@nuxt/schema'
import cloudflare from './cloudflare-pages'
import node from './node'

export function findPreset(nuxt: Nuxt) {
  if (nuxt.options.nitro.preset === 'cloudflare-pages') {
    return cloudflare
  }

  return node
}
