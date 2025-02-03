import { definePreset } from '../utils/preset'
import { logger } from '../utils/dev'
import nodePreset from './node'

export default definePreset({
  name: 'vercel',
  async setupNitro(nitroConfig, options) {
    if (nitroConfig.runtimeConfig?.content?.database?.type === 'sqlite') {
      logger.warn('Deploying sqlite database to Vercel is not possible, switching to Postgres database with `POSTGRES_URL`.')
      nitroConfig.runtimeConfig!.content!.database = {
        type: 'postgres',
        url: process.env.POSTGRES_URL,
      }
    }

    await nodePreset.setupNitro(nitroConfig, options)
  },
})
