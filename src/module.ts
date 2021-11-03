import type { Nuxt } from '@nuxt/kit'
import { defineNuxtModule, installModule } from '@nuxt/kit'
import { setupConfigModule } from './config'
import { setupI18nModule } from './i18n'
import { setupAppModule } from './app'

export default defineNuxtModule({
  async setup(_moduleOptions: any, nuxt: Nuxt) {
    setupAppModule(nuxt)

    setupConfigModule(nuxt)

    setupI18nModule(nuxt)

    await installModule(nuxt, '@nuxtjs/i18n')

    await installModule(nuxt, '@nuxt/image')
  }
})
