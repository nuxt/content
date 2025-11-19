import { hasNuxtModule } from '@nuxt/kit'
import { provider } from 'std-env'
import type { Nuxt } from '@nuxt/schema'
import awsAmplify from './aws-amplify'
import cloudflare from './cloudflare'
import netlify from './netlify'
import node from './node'
import nuxthub from './nuxthub'
import vercel from './vercel'

export function findPreset(nuxt: Nuxt) {
  const preset = (process.env.NITRO_PRESET || nuxt.options.nitro.preset || provider).replace(/_/g, '-')

  if (hasNuxtModule('@nuxthub/core', nuxt)) {
    return nuxthub
  }

  if (preset.includes('cloudflare')) {
    return cloudflare
  }

  if (preset.includes('netlify') || process.env.NETLIFY === 'true') {
    return netlify
  }

  if (preset.includes('vercel')) {
    return vercel
  }

  if (preset === 'aws-amplify' || typeof process.env.AWS_AMPLIFY_DEPLOYMENT_ID !== 'undefined') {
    return awsAmplify
  }

  return node
}
