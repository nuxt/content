import { getContent } from './core.js'
import { createDocus } from '~docus-context'
import settings from '~docus-cache/docus-settings.json'

/**
 * @type {import('@nuxt/types').Plugin}
 */
export default async function (ctx, inject) {
  const $docus = await createDocus(ctx, settings, getContent(ctx))

  inject('docus', $docus)
}
