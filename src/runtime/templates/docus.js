import { createDocus } from '#docus'
import settings from '~docus/cache/docus-settings.json'

/**
 * @type {import('@nuxt/types').Plugin}
 */
export default async function (ctx, inject) {
  const $docus = await createDocus(ctx, settings)

  inject('docus', $docus)
}
