import type { Nuxt } from '@nuxt/schema'
import cloudflare from './cloudflare-pages/preset'
import node from './node/preset'

export function findPreset(nuxt: Nuxt) {
  if (nuxt.options.nitro.preset === 'cloudflare-pages') {
    return cloudflare
  }

  return node
}
