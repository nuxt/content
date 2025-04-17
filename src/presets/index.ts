import type { Nuxt } from '@nuxt/schema'
import { hasNuxtModule } from '@nuxt/kit'
import cloudflare from './cloudflare-pages'
import vercel from './vercel'
import node from './node'
import nuxthub from './nuxthub'
import netlify from './netlify'
import awsAmplify from './aws-amplify'

export function findPreset(nuxt: Nuxt) {
  const preset = nuxt.options.nitro.preset?.replace(/_/g, '-')

  if (hasNuxtModule('@nuxthub/core', nuxt)) {
    return nuxthub
  }

  if (preset === 'cloudflare-pages') {
    return cloudflare
  }

  if (preset === 'netlify-legacy' || process.env.NETLIFY === 'true') {
    return netlify
  }

  if (preset === 'vercel' || process.env.VERCEL === '1') {
    return vercel
  }

  if (preset === 'aws-amplify' || typeof process.env.AWS_AMPLIFY_DEPLOYMENT_ID !== 'undefined') {
    return awsAmplify
  }

  return node
}
