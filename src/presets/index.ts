import { hasNuxtModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import awsAmplify from './aws-amplify'
import cloudflare from './cloudflare'
import netlify from './netlify'
import node from './node'
import nuxthub from './nuxthub'
import vercel from './vercel'

export function findPreset(nuxt: Nuxt) {
  const preset = nuxt.options.nitro.preset?.replace(/_/g, '-')

  if (hasNuxtModule('@nuxthub/core', nuxt)) {
    return nuxthub
  }

  if (['cloudflare-pages', 'cloudflare-module', 'cloudflare-durable'].includes(preset || '')) {
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
