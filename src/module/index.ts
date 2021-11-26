import { defineNuxtModule, installModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { useDefaultOptions } from './options'
import { setupDevTarget } from './dev'
import { setupAppModule } from './app'
import { setupConfigModule } from './config'
import { setupI18nModule } from './i18n'
import { setupComponentMetaModule } from './meta'
import { setupContentModule } from './content'
import type { DocusOptions } from 'types'

export default defineNuxtModule((nuxt: Nuxt) => ({
  configKey: 'content',
  defaults: useDefaultOptions(nuxt),
  async setup(options: DocusOptions, nuxt: Nuxt) {
    if (nuxt.options.dev) setupDevTarget(options, nuxt)

    setupAppModule(nuxt, options)

    setupConfigModule(nuxt)

    await setupContentModule(nuxt, options)

    await setupI18nModule(nuxt)

    await setupComponentMetaModule(nuxt)

    await installModule(nuxt, '@nuxt/image')
  }
}))
