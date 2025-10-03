// src/presets/cloudflare.ts
import { logger } from '../utils/dev'
import { definePreset } from '../utils/preset'
import { applyContentDumpsPreset } from './shared-dumps'

export default definePreset({
  name: 'cloudflare',
  async setup(options) {
    if (!options.database || options.database.type !== 'd1') {
      options.database = { type: 'd1', bindingName: 'DB' }
      return
    }

    if ('binding' in options.database && options.database.binding && !options.database.bindingName) {
      options.database.bindingName = options.database.binding
    }

    options.database.bindingName ||= 'DB'
  },
  async setupNitro(nitroConfig, ctx) {
    if (nitroConfig.runtimeConfig?.content?.database?.type === 'sqlite') {
      logger.warn('Deploying to Cloudflare requires using D1 database, switching to D1 database with binding `DB`.')
      nitroConfig.runtimeConfig!.content!.database = { type: 'd1', bindingName: 'DB' }
    }

    applyContentDumpsPreset(nitroConfig, { ...ctx, platform: 'cloudflare' })
  },
})
