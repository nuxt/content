import { Nuxt } from '@nuxt/kit'
import { DocusOptions } from '../types'
import setupStaticTarget from './static'
import setupDevTarget from './dev'

export default function setupTarget(options: DocusOptions, nuxt: Nuxt) {
  if (nuxt.options.dev) {
    return setupDevTarget(options, nuxt)
  }

  if (options._isSSG) {
    return setupStaticTarget(options, nuxt)
  }
}
