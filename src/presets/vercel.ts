import { definePreset } from '../utils/preset'
import { logger } from '../utils/dev'
import nodePreset from './node'

export default definePreset({
  name: 'vercel',
  parent: nodePreset,
  async setup(options, nuxt) {
    options.database ||= { type: 'sqlite', filename: '/tmp/contents.sqlite' }

    const vercelRuntime = (nuxt.options.nitro as Record<string, unknown>)?.vercel as { functions?: { runtime?: string } } | undefined
    if (typeof vercelRuntime?.functions?.runtime === 'string' && vercelRuntime.functions.runtime.startsWith('bun')) {
      options.experimental ||= {}
      options.experimental.sqliteConnector ||= 'bun'
    }
  },
  async setupNitro(nitroConfig) {
    const database = nitroConfig.runtimeConfig?.content?.database
    if (database?.type === 'sqlite' && !database?.filename?.startsWith('/tmp')) {
      logger.warn('Deploying sqlite database to Vercel is possible only in `/tmp` directory. Using `/tmp/contents.sqlite` instead.')
      database.filename = '/tmp/contents.sqlite'
    }
  },
})
