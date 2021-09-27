import type { Nuxt } from '@nuxt/kit'
import { defineNuxtModule } from '@nuxt/kit'
import { setupConfigModule } from './config'
import { setupI18nModule } from './i18n'
import { setupAppModule } from './app'

export default defineNuxtModule({
  async setup(_moduleOptions: any, nuxt: Nuxt) {
    setupAppModule(nuxt)

    // Also sets up theme
    setupConfigModule(nuxt)

    await setupI18nModule(nuxt)
  }
})
