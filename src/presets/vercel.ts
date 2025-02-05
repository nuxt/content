import { definePreset } from '../utils/preset'
import { logger } from '../utils/dev'
import nodePreset from './node'

export default definePreset({
  name: 'vercel',
  async setupNitro(nitroConfig, options) {
    if (nitroConfig.runtimeConfig?.content?.database?.type === 'sqlite') {
      logger.warn('Deploying sqlite database to Vercel is not recommended if you are not prerendering your site.')
      logger.info('We recommend using a hosted SQL database like Neon, Turso, Supabase or others.')
    }

    await nodePreset.setupNitro(nitroConfig, options)
  },
})
