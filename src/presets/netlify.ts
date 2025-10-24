import { definePreset } from '../utils/preset'
import { logger } from '../utils/dev'
import nodePreset from './node'

export default definePreset({
  name: 'netlify',
  parent: nodePreset,
  async setup(options) {
    options.database ||= { type: 'sqlite', filename: '/tmp/contents.sqlite' }
  },
  async setupNitro(nitroConfig) {
    const database = nitroConfig.runtimeConfig?.content?.database
    if (database?.type === 'sqlite' && !database?.filename?.startsWith('/tmp')) {
      logger.warn('Deploying sqlite database to Netlify is possible only in `/tmp` directory. Using `/tmp/contents.sqlite` instead.')
      database.filename = '/tmp/contents.sqlite'
    }
  },
})
