import type { Nuxt } from '@nuxt/schema'
import { hasNuxtModule } from '@nuxt/kit'
import cloudflare from './cloudflare-pages'
import vercel from './vercel'
import node from './node'
import nuxthub from './nuxthub'

export function findPreset(nuxt: Nuxt) {
  const preset = nuxt.options.nitro.preset?.replace(/_/g, '-')

  if (hasNuxtModule('@nuxthub/core', nuxt)) {
    return nuxthub
  }

  if (preset === 'cloudflare-pages') {
    return cloudflare
  }

  if (preset === 'vercel' || process.env.VERCEL === '1') {
    return vercel
  }

  return node
}
