import type { Nuxt } from '@nuxt/schema'
import cloudflare from './cloudflare-pages'
import vercel from './vercel'
import node from './node'

export function findPreset(nuxt: Nuxt) {
  const preset = nuxt.options.nitro.preset

  if (preset === 'cloudflare-pages') {
    return cloudflare
  }

  if (preset === 'vercel' || process.env.VERCEL === '1') {
    return vercel
  }

  return node
}
